var config = {};

config.serverId = 0;

config.redis = {};
config.redis.port = 6379;
config.redis.host = '127.0.0.1';

config.s3Server = {};
config.s3Server.bucket = 'styletransferimage';
config.s3Server.targetPrefix = 'target1/';
config.s3Server.stylePrefix = 'style1/';
config.s3Server.outputPrefix = 'output1/';

config.rabbitmq = {};
config.rabbitmq.host = 'amqp://Zhiyi:Zhiyi1993@52.201.94.148';
config.rabbitmq.queueName = 'task_queue';

config.grpc = {};
config.grpc.hostname = '54.164.44.43:50051'

module.exports = config;
