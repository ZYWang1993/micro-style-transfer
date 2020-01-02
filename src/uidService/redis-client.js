const redis = require('redis');
const {promisify} = require('util');
const config = require('./config');
const client = redis.createClient(config.redis.port, config.redis.host);

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const llenAsync = promisify(client.llen).bind(client);
const existAsync = promisify(client.exists).bind(client);
const rpushxAsync = promisify(client.rpushx).bind(client);
const incrAsync = promisify(client.incr).bind(client);
const keysAsync = promisify(client.keys).bind(client);

function apiRateLimiter(ip) {
  return new Promise((reslove, reject) => {

    llenAsync(ip)
    .then((current) => {
      if (current > 100) {
        reject('tooManyRequests');
      } else {
        return existAsync(ip);
      }
    })
    .then((status) => {
      if (!status) {
        let multi = client.multi();
        multi.rpush(ip, ip);
        multi.expire(ip, 3600);
        multi.exec((err, replies) => {
          if (err) {
            reject('error');
          } else {
            reslove('success');
          }
        });
      } else {
        return rpushxAsync(ip, ip);
      }
    })
    .then((data) => {
      reslove('success');
    })
    .catch((err) => {
      reject('error');
    });

  });
}

function getCounter(key) {
  return new Promise((reslove, reject) => {
    let multi = client.multi();
    multi.incr(key);
    multi.expire(key, 10);
    multi.exec((err, replies) => {
      if (err) {
        reject('error');
      } else {
        reslove(replies[0]);
      }
    });
  });
}

module.exports = {
  ...client,
  getCounter: getCounter,
  apiRateLimiter: apiRateLimiter
};
