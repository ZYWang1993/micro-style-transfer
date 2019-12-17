const express = require('express');
const router = express.Router();
const amqp = require('amqplib/callback_api');
const multer = require('multer')
const upload = multer({ dest: '/'});
const config = require('../config');

function generateUid() {
  var serverId = config.serverId;
  var serverIdBinary = convertToBinary(serverId, 3);
  var seconds = Math.floor(new Date().getTime() / 1000);
  var secondsBinary = convertToBinary(seconds, 32);
  var random = Math.floor(Math.random() * 8191);
  var randomBinary = convertToBinary(random, 13);
  var res = randomBinary + serverIdBinary + secondsBinary;
  return baseEncode(res);
}

function convertToBinary(num, len) {
  if (typeof(num) != "number" || typeof(len) != "number") {
    return Number(1).toString(2);
  }
  var res = num.toString(2);
  if (res.length > len) {
    // trim the last `len` bit of the binary string
    res = res.substr(res.length - len);
    return res;
  }
  while (res.length < len) {
    res = '0' + res;
  }
  return res;
}

function baseEncode(str) {
  const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");
  if (str.length % 6 != 0) {
    return '';
  }
  let len = str.length / 6;
  var res = '';
  for (let i = 0; i < len; i++) {
    let num = parseInt(str.substring(6*i, 6*(i+1)), 2);
    res += charSet[num];
  }
  return res;
}

router.post('/', upload.array('image'), function (req, res, next) {
  console.log('request accepted');
  var id = generateUid();
  console.log(req.files);
  res.send({
    message: 'Please remeber your requests ID and use it to retrive your image',
    u_id: id
  });
});

module.exports = router
