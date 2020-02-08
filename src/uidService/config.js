var config = {};

config.serverId = 0;

config.redis = {};
config.redis.port = 6379;
config.redis.host = 'redis';

config.apiRateLimit = 50;

module.exports = config;
