const shortid = require('shortid');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const uuid = require('uuid/v1');
const User = require('../../app/models/user');
const Company = require('../../app/models/company');
const errors = require('../../app/errors');
const uploadUtil = require('../../library/upload');
const mailer = require('../../library/mail');
const logger = require('../logger');

const stats = require('../../library/stats');

// One day in ms
const ONE_DAY = 1000 * 60 * 60 * 24;

class UserService {
  /**
   * Class constructor
   *
   * @constructor
   * */
  constructor() {
    this.saltRounds = 10;
  }

  /**
   * Save a user information to the database
   * @param {Object} data User object
   * @param {Object} authUser authenticated User
   * @param {string} reqId Request ID used for logging
   * @param {boolean} suppressEmail Whether to suppress sending the activation email. Default false.
   * @param {int} activationTimeout The amount of time (in days) to set the expiration date, relative to now.
   *                                 Defaults to 2 days.
   * @return {Object} The user object that was created.
   */
  createUser(
    data,
    authUser,
    reqId,
    suppressEmail = false,
    activationTimeout = 2,
  ) {
    // Generates a unique identifier which we use as the activation code.
    const activationCode = uuid();
    data.activation_code = activationCode;
    data.expiry_at = new Date(Date.now() + activationTimeout * ONE_DAY);
    return new User()
      .save(data, { user_id: authUser.id })
      .then((user) => {
        if (suppressEmail) {
          logger.warn(
            `Request ID: ${reqId} Not sending mail to ${user.get('email')}.`,
          );
        } else {
          const message = mailer.templates.accountConfirmation({
            recipientName: `${user.get('first_name')} ${user.get('last_name')}`,
            activationLink: `${
              process.env.BASE_URL
            }/activate/${activationCode}`,
          });
          const htmlMessage = mailer.htmlTemplates.accountConfirmation({
            recipientName: `${user.get('first_name')} ${user.get('last_name')}`,
            activationLink: `${
              process.env.BASE_URL
            }/activate/${activationCode}`,
          });

          logger.info(
            `Request ID: ${reqId} - Sending activation email to ${
              user.email
            } ...`,
          );
          mailer.sendEmail(user.get('email'), 'Welcome!', message, htmlMessage);
        }

        logger.info(`Request ID: ${reqId} - Created user`);
        return user.refresh();
      })
      .catch((error) => {
        logger.error(`Request ID: ${reqId} - Error creating user ${error}`);
        if (error.code === 'ER_DUP_ENTRY') {
          throw new errors.UserAlreadyCreated(
            'User with this email address already exists.',
          );
        }
        stats.increment('client_dashboard.api.users.errors', 1);
        throw error;
      });
  }

  /**
   * Create a new user
   *
   * @param req - Restify request object
   *
   * @return {Promise.<T>}
   * */
  create(req) {
    const reqId = shortid.generate();
    const allowedKeys = [
      'first_name',
      'last_name',
      'email',
      'company_id',
      'test_mode_enabled',
    ];

    const userData = _.pick(req.body, allowedKeys);
    const suppressEmail = req.body.suppress_email;
    const activationTimeout = req.body.activation_timeout || 2;

    logger.info(
      `Request ID: ${reqId} - Creating a new User and ${
        suppressEmail ? 'not sending email.' : 'sending email.'
      }`,
    );

    // If there is a company ID, check if company exit
    if (userData.company_id) {
      logger.info(`Does company ${userData.company_id} exist ?`);
      return new Company({ id: userData.company_id })
        .fetch()
        .then((company) => {
          if (!company) {
            logger.error(`Company ${userData.company_id} does not exist`);
            throw new errors.CompanyNotFound(
              `Company ID: ${userData.company_id} does not exist`,
            );
          }
          return this.createUser(userData, req.user, reqId, suppressEmail);
        })
        .catch((error) => {
          logger.error(
            `Error checking if company ID ${
              userData.company_id
            } exist. Error ${error}`,
          );
          throw error;
        });
    }
    return this.createUser(
      userData,
      req.user,
      reqId,
      suppressEmail,
      activationTimeout,
    );
  }

  login(data) {
    const reqId = shortid.generate();
    const credentials = _.pick(data, ['email']);

    /**
     * Return a user with a matching email.
     * */
    return new User()
      .where('email', credentials.email)
      .fetch({ withRelated: ['company'] })
      .then((user) => {
        if (!user) {
          logger.error(
            `Request ID: ${reqId} - 'Invalid email/password combination for ${
              credentials.email
            }`,
          );
          throw new errors.UserNotFound('Invalid email/password combination');
        }
        if (!user.get('active')) {
          logger.info(
            `Request ID: ${reqId} - User ${user} has been deactivated`,
          );
          throw new errors.DeactivatedUser('User account is disabled');
        }
        logger.info(
          `Request ID: ${reqId} - User with email ${
            credentials.email
          } found. Attempting to authenticate`,
        );
        if (user.has('company_id') && !user.related('company').has('id')) {
          logger.error(
            `Request ID: ${reqId} - Invalid login. The company does not exist`,
          );
          throw new errors.UserNotFound('Invalid email/password combination');
        }
        return user.comparePassword(data.password).then((isValid) => {
          if (isValid) {
            return {
              message: 'User logged in successfully',
              token: user.generateToken(),
            };
          }
          throw new errors.UserNotFound('Invalid email/password combination');
        });
      })
      .catch((err) => {
        logger.error(
          `Request ID: ${reqId} - Error ${err} authenticating ${
            credentials.email
          }`,
        );
        throw err;
      });
  }

  /**
   * Get a single user by the user ID
   *
   * @param {Integer} userId ID of the user
   */
  getUser(req) {
    const reqId = shortid.generate();
    const userId = req.targetUser.get('id');
    return req.targetUser
      .load(['roles.permissions', 'branch', 'company'])
      .then((user) => {
        logger.info(`Request ID: ${reqId} - User with ID: ${userId} found`);
        return user;
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error occured fetching user with ID: ${userId}: ${error}`,
        );
        throw error;
      });
  }

  /**
   * Hash and store a user with other accompanying details
   *
   * @param {Object} user - Bookshelf user model
   * @param {Object} update - Details to be updated - company_id, password, first_name, etc
   * @param {Object} authUser - Authenticate User performing update action
   */
  hashPasswordAndSaveDetails(user, data, authUser, reqId) {
    const options = { patch: true, user_id: authUser.id };

    if (data.password) {
      return new Promise((resolve, reject) => {
        logger.info(
          `Request ID: ${reqId} - Is user ${user.get(
            'id',
          )} trying to change password to current one`,
        );
        bcrypt.compare(data.password, user.get('password'), (err, isValid) => {
          if (!isValid) {
            logger.info(
              `Request ID: ${reqId} - User ${user.get(
                'id',
              )} is changing to a new password`,
            );
            return bcrypt
              .genSalt(this.saltRounds)
              .then((salt) => bcrypt.hash(data.password, salt))
              .then((hash) => {
                data.password = hash;
                user
                  .save(data, options)
                  .then((updatedUser) => {
                    logger.info(
                      `Request ID: ${reqId} - User ${user.get(
                        'id',
                      )} changed password successfully`,
                    );
                    resolve(updatedUser);
                  })
                  .catch((error) => {
                    logger.error(
                      `Request ID: ${reqId} - User ${user.get(
                        'id',
                      )} password change failed: ${error}`,
                    );
                    reject(error);
                  });
              })
              .catch((error) => {
                logger.error(
                  `Request ID: ${reqId} - User ${user.get(
                    'id',
                  )} had issues changing password`,
                );
                throw error;
              });
          }
          logger.info(
            `Request ID: ${reqId} - User ${user.get(
              'id',
            )} is trying to change to the same password`,
          );
          reject(
            new errors.PasswordAlreadyUsed(
              'You have already used this password. Use a new one.',
            ),
          );
          return true;
        });
      });
    }
    return user.save(data, options);
  }

  /**
   * Update a user's current information
   *
   * @param {Object} req - Restify request object
   */
  update(req) {
    const reqId = shortid.generate();
    const update = _.pick(req.body, [
      'active',
      'first_name',
      'last_name',
      'email',
      'password',
      'company_id',
      'branch_id',
      'test_mode_enabled',
    ]);
    update.branch_id = update.branch_id || null;
    return Promise.resolve(req.targetUser)
      .then((user) => {
        if (update.company_id) {
          return new Company({ id: update.company_id })
            .fetch()
            .then((company) => {
              if (company) {
                logger.error(
                  `Request ID: ${reqId} - Company ${update.company_id} found`,
                );
                return this.hashPasswordAndSaveDetails(
                  user,
                  update,
                  req.user,
                  reqId,
                );
              }

              logger.error(
                `Request ID: ${reqId} - Company ${
                  update.company_id
                } does not exist`,
              );
              throw new errors.CompanyNotFound('This company does not exist');
            });
        }
        return this.hashPasswordAndSaveDetails(user, update, req.user, reqId);
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error occured while trying to update user : ${error}`,
        );
        throw error;
      });
  }

  /**
   * Get all users associated with a company
   * @param {number} companyId  - This is the of the company
   * @returns {Object} - This object contains the company's details and also the associated
   */
  listByCompany(companyId) {
    const reqId = shortid.generate();

    logger.info(
      `Request ID: ${reqId} - Get users for this company ${companyId}`,
    );
    return Company.where({ id: companyId })
      .fetch({ withRelated: ['users', 'users.branch'] })
      .then((company) => {
        if (!company) {
          throw new errors.CompanyNotFound('Company not found');
        }
        logger.info(
          `Request ID: ${reqId} - Gotten users for company ${companyId}`,
        );
        return company.related('users');
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - There was an error getting users for company: ${companyId} - ${error}`,
        );
        throw error;
      });
  }

  listApplicationUsers() {
    const reqId = shortid.generate();

    return new User()
      .where({ company_id: null })
      .fetchAll()
      .then((users) => {
        logger.info(
          `Request ID: ${reqId} - Get application users successfully`,
        );
        return users;
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error getting application users ${
            error.message
          }`,
        );
        throw error;
      });
  }

  /**
   * Uploads a user profile image
   *
   * @param {number} userId, user whose profile pic we are uploading.
   * @param {string} dataUrl, base64 encoded string representation of the image.
   */
  updateProfileImage(req) {
    const reqId = shortid.generate();
    const userId = req.targetUser.get('id');
    logger.info(
      `Request ID: ${reqId} - Getting a user to upload profile image`,
    );
    return uploadUtil
      .uploadImage('profile_pictures', userId, req.body.dataUrl)
      .then((message) => {
        return req.targetUser
          .save(
            { profile_pic: message.url },
            { patch: true, user_id: req.user.id },
          )
          .then(() => {
            logger.info(
              `Request ID: ${reqId} - Profile image for user with id ${userId} uploaded`,
            );
            return message;
          });
      })
      .catch((err) => {
        logger.error(
          `Request ID: ${reqId} - Profile image for user with id ${userId} not uploaded`,
        );
        throw err;
      });
  }
}

module.exports = new UserService();
