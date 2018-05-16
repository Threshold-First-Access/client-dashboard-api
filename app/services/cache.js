const redis = require('redis');
const shortid = require('shortid');
const config = require('../config/config');
const logger = require('../logger');

const env = process.env.NODE_ENV || 'development';
const cache = config.cache[env];

class CacheService {
  /**
   * Cache class constructor
   *
   * @param  {Object} logger
   */
  constructor() {
    this.client = redis.createClient(cache.port, cache.host);
  }

  /**
   * Persist data to cache by identifier
   *
   * @param  {string} identifier Unique ID for data to cache
   * @param  {string} data data to cache
   */
  set(identifier, data) {
    const reqId = shortid.generate();
    logger.info(`Request ID: ${reqId} - Save ${identifier} to memory`);
    return this.client.set(identifier, data, redis.print);
  }

  /**
   * Get data from cache by identifier
   *
   * @param  {string} identifier Unique ID for data to cache
   */
  get(identifier) {
    const reqId = shortid.generate();
    logger.info(`Request ID: ${reqId} - Get ${identifier} from memory`);

    return new Promise((resolve, reject) => {
      this.client.get(identifier, (err, res) => {
        if (!err && res) {
          logger.info(
            `Request ID: ${reqId} - Get data from cache with identifier ${identifier}`,
          );
          resolve(res);
        } else {
          logger.error(
            `Request ID: ${reqId} - Error getting data from cache with identifier ${identifier}. Error: ${err}`,
          );
          reject(err);
        }
      });
    });
  }
  /**
   * Clear data from cache by identifier
   *
   * @param {string} identifier Unique ID for data to cache
   */
  clear(identifier) {
    const reqId = shortid.generate();
    logger.info(
      `Request ID: ${reqId} - Clear permissions for ${identifier} from memory`,
    );
    return this.client.del(identifier, redis.print);
  }
}

module.exports = new CacheService();
