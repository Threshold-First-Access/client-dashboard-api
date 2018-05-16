const shortid = require('shortid');
const bookshelf = require('../bookshelf');
const logger = require('../logger');
const cache = require('../services/cache');

class PermissionService {
  /**
   * Get permissions by user ID.
   *
   * @param {integer} id User ID
   */
  get(id) {
    const reqId = shortid.generate();

    return cache
      .get(`user_permissions_${id}`)
      .then((permissions) => {
        logger.info(
          `Request ID: ${reqId} - Get permissions for user with id ${id} from cache memory`,
        );
        return JSON.parse(permissions);
      })
      .catch(() => {
        const query = `SELECT * FROM permissions WHERE role_id IN (SELECT role_id FROM roles_users WHERE user_id = ?)`;

        return bookshelf.knex
          .raw(query, [id])
          .then((permissions) => {
            logger.info(
              `Request ID: ${reqId} - Get permissions for user with id ${id} from database and add to cache`,
            );
            cache.set(`user_permissions_${id}`, JSON.stringify(permissions[0]));
            return permissions[0];
          })
          .catch((error) => {
            logger.error(
              `Request ID: ${reqId} - Error getting permissions for user with id ${id}: ${error}`,
            );
            throw error;
          });
      });
  }
}

module.exports = new PermissionService();
