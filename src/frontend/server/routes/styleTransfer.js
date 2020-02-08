const express = require('express');
const router = express.Router();
const amqp = require('amqplib/callback_api');
const multer = require('multer');
const config = require('../config');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Create S3 service object
AWS.config.loadFromPath('./aws_config.json');
const s3 = new AWS.S3();

// Create grpc client
const PROTO_PATH = __dirname + '/../protos/uid_management.proto';
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const uidmanagement = protoDescriptor.uidmanagement;

const client = new uidmanagement.UidManagement(config.grpc.hostname,
                                     grpc.credentials.createInsecure());

// create multer middleware
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images')
  },
  filename: function (req, file, cb) {
    fileExt = file.mimetype.split('/')[1]
    cb(null, file.fieldname + Date.now() + '.' + fileExt)
  }
})
var upload = multer({ storage: storage })

function getFileExt(mimeType){
  return mimeType.split('/')[1]
}

function genUploadParams(filePath, uploadKey) {
  // Configure the file stream and obtain the upload parameters
  var uploadParams = {Bucket: config.s3Server.bucket, Key: '', Body: ''};
  var fullPath = path.join(__dirname, filePath);
  var fileStream = fs.createReadStream(fullPath);
  fileStream.on('error', function(err) {
    console.log('File Error', err);
  });
  uploadParams.Body = fileStream;
  uploadParams.Key = uploadKey;
  return uploadParams;
}

function getUid(ipAddress) {
  return new Promise(function (reslove, reject) {
    client.getUid({clientIp: ipAddress}, function(err, response) {
      if (err) {
        reject('uid_error');
      } else {
        reslove(response.uid);
      }
    });
  });
}

function imageUpload(params) {
  return s3.putObject(params).promise();
}

function amqpConnect(hostname) {
  return new Promise((reslove, reject) => {
    amqp.connect(hostname, function(error, connection) {
      if (error) {
        reject('queue_error');
      } else {
        reslove(connection);
      }
    });
  });
}

function amqpSendMessage(connection, msg) {
  return new Promise((reslove, reject) => {
    connection.createChannel(function(error, channel) {
      if (error) {
        reject('queue_error');
      }
      var queue = config.rabbitmq.queueName;

      channel.assertQueue(queue, {
        durable: false
      });

      channel.sendToQueue(queue, Buffer.from(msg), {
         persistent: false
      });
      console.log(" [x] Sent '%s'", msg);
      reslove('success');
      setTimeout(function() {
        connection.close();
      }, 500);
    });
  });
}

function deleteFile (file) {
  fs.unlink(file, function (err) {
    if (err) {
      console.log(err);
    } else {
    }
  });
}

router.post('/', upload.array('image'), function (req, res, next) {

  console.log('request accepted from' + req.connection.remoteAddress);

  var message = '';
  var UID = '';
  getUid(req.connection.remoteAddress)
  .then(function(id) {

    UID = id
    var targetFile = req.files[0]
    var filePathTarget = '../images/' + targetFile.filename;
    var uploadTargetName = id + '.' + getFileExt(targetFile.mimetype);
    var uploadKeyTarget = config.s3Server.targetPrefix + uploadTargetName;
    var uploadParamsTarget = genUploadParams(filePathTarget, uploadKeyTarget);

    var styleFile = req.files[1];
    var filePathStyle = '../images/' + styleFile.filename;
    var uploadStyleName = id + '.' + getFileExt(styleFile.mimetype);
    var uploadKeyStyle = config.s3Server.stylePrefix + uploadStyleName;
    var uploadParamsStyle = genUploadParams(filePathStyle, uploadKeyStyle);

    message = uploadTargetName + ' ' + uploadStyleName;

    return Promise.all([imageUpload(uploadParamsTarget), imageUpload(uploadParamsStyle)]);
  })
  .then(function(args) {
    const HOST = config.rabbitmq.host;
    return amqpConnect(HOST);
  })
  .then(function(connection) {
    return amqpSendMessage(connection, message);
  })
  .then(function(status) {
    res.send({
      message: 'Please remeber your requests ID and use it to retrive your image',
      u_id: UID
    });
    deleteFile('./images/' + req.files[0].filename);
    deleteFile('./images/' + req.files[1].filename);
  })
  .catch(function(err) {
    if (err == 'uid_error') {
      res.send({
        message: 'Sorry, we are not able to fullfill your request right now, you may exceed our API rate limit last hour, please wait and try again.',
        u_id : ''
      });
    } else if (err == 'queue_error') {
      res.send({
        message: 'Sorry, we are not able to fullfill your request due to a large volume of queue',
        u_id : ''
      });
    } else {
      res.send({
        message: 'Sorry, we are not able to fullfill your request now due to the maintenance of service',
        u_id : ''
      });
    }
    try {
      deleteFile('./images/' + req.files[0].filename);
      deleteFile('./images/' + req.files[1].filename);
    } catch (error) {
      console.log(error);
    }
  });

});

module.exports = router;
