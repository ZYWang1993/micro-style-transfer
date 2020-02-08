const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const path = require('path');
const config = require('../config');
const { promisify } = require('util');
const multer = require('multer');
const fs = require('fs');
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

function isImageExist(id) {
 return new Promise(function (reslove, reject) {
   client.isImageExist({id: id}, function(err, response) {
     if (err) {
       reject(err);
     } else {
       reslove(response.status);
     }
   });
 });
}

function genDownloadParams(downloadKey) {
  // Configure the file stream and obtain the download parameters
  var downloadParams = {Bucket: config.s3Server.bucket, Key: ''};
  downloadParams.Key = downloadKey;
  return downloadParams;
}

function imageDownload(params) {
  return s3.getObject(params).promise();
}

function deleteFile (file) {
  fs.unlink(file, function (err) {
    if (err) {
      console.log(err);
    } else {
    }
  });
}

router.get('/:imageId', function (req, res) {
  var uid = req.params.imageId;
  isImageExist(uid)
  .then(function(status) {
    if (status == 'true') {
      var downloadKey = config.s3Server.outputPrefix + uid + config.s3Server.outputExt;
      var downloadParams = genDownloadParams(downloadKey);
      return imageDownload(downloadParams);
    } else if (status == 'false'){
      throw new Error('not in bf');
    } else {
      throw new Error('error');
    }
  })
  .then(function(data) {
    res.send({
      file: data
    });
  })
  .catch(function(err) {
    if (err.message == 'not in bf') {
      res.send({
        message: 'Sorry, you may input a non-exist key or your request is still processing.'
      });
    } else {
      res.send({
        message: 'Sorry, we are not able to fullfill your request now due to an error'
      });
    }
  });
});

module.exports = router;
