var PROTO_PATH = __dirname + '/protos/uid_management.proto';
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var redis = require('redis');
var config = require('./config');
var redisClient = require('./redis-client');

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

var uidmanagement = protoDescriptor.uidmanagement;

function genUid(counter) {
  var counterBinary = convertToBinary(counter, 10);

  var serverId = config.serverId;
  var serverIdBinary = convertToBinary(serverId, 3);

  var seconds = Math.floor(new Date().getTime() / 1000);
  var secondsBinary = convertToBinary(seconds, 32);

  var random = Math.floor(Math.random() * 7);
  var randomBinary = convertToBinary(random, 3);

  var res = randomBinary + serverIdBinary + counterBinary + secondsBinary;
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

function getUid(call, callback) {
  redisClient.apiRateLimiter(call.request.clientIp).
  then((status) => {
    let curTimeStamp = Math.floor(Date.now() / 1000);
    return redisClient.getCounter(curTimeStamp)
  })
  .then((counter) => {
    callback(null, {uid: genUid(counter)});
  })
  .catch((err) => {
    callback(null, {uid: 'err'});
  })
}

function transferCompleted(call, callback) {
  let status = 'false';
  if (call.request.id) {
    status = 'true'
  }
  callback(null, {status: status});
}

function getUidManagementServer() {
  var server = new grpc.Server();
  server.addService(uidmanagement.UidManagement.service, {
    GetUid: getUid,
    TransferCompleted: transferCompleted
  });
  return server;
}

const PORT = 50051;

var uidManagementServer = getUidManagementServer();
uidManagementServer.bind('0.0.0.0:' + PORT, grpc.ServerCredentials.createInsecure());
uidManagementServer.start();
