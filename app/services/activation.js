const uuid = require('uuid/v1');
const shortid = require('shortid');

const mailer = require('../../library/mail');
const logger = require('../logger');
const errors = require('../../app/errors');
const User = require('../../app/models/user');
const UserService = require('../services/user');

class ActivationService {
  /**
   * Validate activation code
   *
   * @param {String} activationCode - activation code uud
   */
  validateActivationCode(activationCode) {
    const reqId = shortid.generate();
    return new User()
      .where({ activation_code: activationCode })
      .fetch()
      .then((user) => {
        if (user) {
          if (user.get('active')) {
            throw new errors.UserAlreadyActive('The user is already active');
          }

          const expiry = new Date(user.get('expiry_at'));
          if (expiry - new Date() < 0) {
            throw new errors.ActionForbidden('Activation code has expired');
          }

          logger.info(`Request ID: ${reqId} - Activation code is valid`);
          return user;
        }

        throw errors.UserNotFound('The user does not exist');
      });
  }

  /**
   * Resend activation invite
   *
   * @param {req} req - Restify request object
   */
  resendActivationLink(req) {
    const reqId = shortid.generate();
    const activationCode = uuid();

    const data = {
      activation_code: activationCode,
      expiry_at: new Date(Date.now() + 86400000),
    };

    return new User()
      .where({ id: req.body.user_id, email: req.body.email })
      .fetch()
      .then((user) => {
        if (user) {
          if (user.get('active')) {
            logger.error(`Request ID: ${reqId} - User is already active`);
            throw new errors.UserAlreadyActive('User is already active');
          }

          return user
            .save(data, { user_id: req.user.id })
            .then(() => {
              const message = mailer.templates.accountConfirmation({
                recipientName: `${user.get('first_name')} ${user.get(
                  'last_name',
                )}`,
                activationLink: `${
                  process.env.BASE_URL
                }/activate/${activationCode}`,
              });
              const htmlMessage = mailer.htmlTemplates.accountConfirmation({
                recipientName: `${user.get('first_name')} ${user.get(
                  'last_name',
                )}`,
                activationLink: `${
                  process.env.BASE_URL
                }/activate/${activationCode}`,
              });
              mailer.sendEmail(
                user.get('email'),
                'Welcome!',
                message,
                htmlMessage,
              );
              logger.info(
                `Request ID: ${reqId} - Activation link email resent`,
              );
              return user.refresh();
            })
            .catch((error) => {
              logger.error(
                `Request ID: ${reqId} - Error resending activation link. ${error}`,
              );
              throw error;
            });
        }
        throw new errors.UserNotFound('User not found.');
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error resending activation link. ${error}`,
        );
        throw error;
      });
  }

  /**
   * Activates a user
   *
   * @param {string} activationCode
   * */
  activate(activationCode, data) {
    const reqId = shortid.generate();

    return this.validateActivationCode(activationCode).then(() => {
      if (data.password !== data.confirm_password) {
        logger.error(
          `Request ID: ${reqId} - Password and password confirmation do not match`,
        );
        throw new errors.ActionForbidden('Passwords do not match');
      }

      return new User()
        .where({ activation_code: activationCode })
        .fetch()
        .then((user) => {
          if (user && user.get('active')) {
            throw new errors.UserAlreadyActive('The user is already active');
          } else if (user) {
            logger.info(
              `Request ID: ${reqId} - activating user with id ${user.get(
                'id',
              )}`,
            );
            return UserService.hashPasswordAndSaveDetails(
              user,
              { active: true, password: data.password },
              user,
              reqId,
            );
          } else {
            throw new errors.UserNotFound('The user does not exist');
          }
        })
        .then((user) => {
          logger.info(
            `Request ID: ${reqId} - user with id ${user.get(
              'id',
            )} has been activated`,
          );
          return {
            message: 'User activated successfully',
            token: user.generateToken(),
          };
        })
        .catch((error) => {
          logger.error(`Request ID: ${reqId} error activating user: ${error}`);
          throw error;
        });
    });
  }
}

module.exports = new ActivationService();
