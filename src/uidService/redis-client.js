const redis = require('redis');
const BloomFilter = require('bloomfilter-redis');
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

const bf = new BloomFilter({
  redisSize: 20, // this will create a string value which is 20 MegaBytes in length
  hashesNum: 8, // how many hash functions do we use
  redisKey: 'bloomFilter', //this will create a string which keyname is `test`
  redisClient: client //you can choose to create the client by yourself
});
const bfPromise = bf.init(); // invokes `SETBIT` to allocate memory in redis

function addToBF(id) {
  return new Promise((reslove, reject) => {
    bfPromise
    .then(() => {
      return bf.add(id);
    })
    .then(() => {
      reslove('success');
    })
    .catch((err) => {
      reject(err);
    });
  });
}

function bfContains(id) {
  return new Promise((reslove, reject) => {
    bfPromise
    .then(() => {
      return bf.contains(id);
    })
    .then((result) => {
      reslove(result);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

function apiRateLimiter(ip) {
  return new Promise((reslove, reject) => {

    llenAsync(ip)
    .then((current) => {
      if (current > config.apiRateLimit) {
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
  apiRateLimiter: apiRateLimiter,
  addToBF: addToBF,
  bfContains: bfContains
};
