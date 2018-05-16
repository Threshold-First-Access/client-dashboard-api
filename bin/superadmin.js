const bcrypt = require('bcrypt');
const User = require('../app/models/user');
const logger = require('../app/logger');

const reqId = require('shortid').generate();

const user = {
  first_name: 'Super',
  last_name: 'Administrator',
  email: 'admin@firstaccess.com',
  active: 1,
  superadmin: 1
};

// Check if there are any existing active super administrators
new User({ superadmin: 1, active: 1 })
  .fetch()
  .then((result) => {
    // If none exists, provision one to the database and change password!
    if (!result) {
      return bcrypt.hash('SuperAdmin123&', 10, (err, hash) => {
        user.password = hash;
        return new User()
          .save(user, { user_id: 1 })
          .then(() => {
            logger.info(`Request ID: ${reqId} - Super Administrator has been created`);
            process.exit();
          })
          .catch((error) => {
            logger.error(`Request ID: ${reqId} - Error provisioning super admin: ${error}`);
            process.exit();
          });
      });
    }
    logger.info(`Request ID: ${reqId} - Existing Super Administrators found`);
    return process.exit();
  })
  .catch((error) => {
    logger.error(`Request ID: ${reqId} - Error provisioning supers admin: ${error}`);
    process.exit();
  });
