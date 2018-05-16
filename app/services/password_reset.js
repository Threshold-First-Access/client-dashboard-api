const shortid = require('shortid');
const uuidV4 = require('uuid/v4');
const omit = require('lodash/omit');
const User = require('../models/user');
const PasswordResetRequest = require('../models/password_reset_request');
const errors = require('../errors');
const mailer = require('../../library/mail');
const logger = require('../logger');
const userService = require('../services/user');

class PasswordResetService {
  /**
   * Create a password reset request and send a reset email to the user
   *
   * @param  {string} email email of the user
   */
  requestPasswordReset(email) {
    const reqId = shortid.generate();
    return new User()
      .where({ email })
      .fetch({ withRelated: ['passwordResetRequests'] })
      .then((user) => {
        if (!user) {
          throw errors.UserNotFound('User does not exist');
        }
        const passwordResetRequests = user.related('passwordResetRequests');
        const now = new Date();
        Promise.all(
          passwordResetRequests.map((passwordResetRequest) => {
            if (passwordResetRequest.has('used_at')) {
              return Promise.resolve();
            }
            return passwordResetRequest.save(
              { invalidated_at: now },
              { patch: true },
            );
          }),
        ).then(() => {
          return user
            .related('passwordResetRequests')
            .create({ reset_code: uuidV4() })
            .then((request) => {
              logger.info(
                `Request ID: ${reqId} - Created password reset request for ${email}`,
              );
              const message = mailer.templates.passwordReset({
                recipientName: `${user.get('first_name')} ${user.get(
                  'last_name',
                )}`,
                passwordResetLink: `${
                  process.env.BASE_URL
                }/reset-password/${request.get('reset_code')}`,
              });
              const htmlMessage = mailer.htmlTemplates.passwordReset({
                recipientName: `${user.get('first_name')} ${user.get(
                  'last_name',
                )}`,
                passwordResetLink: `${
                  process.env.BASE_URL
                }/reset-password/${request.get('reset_code')}`,
              });
              mailer.sendEmail(
                user.get('email'),
                'Reset your password',
                message,
                htmlMessage,
              );
              logger.info(
                `Request ID: ${reqId} - Sending password reset email to ${email}`,
              );
            });
        });
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Failed to request password reset: ${error}`,
        );
        throw error;
      });
  }

  /**
   * Create a password reset request and send a reset email to the user
   *
   * @param  {string} resetCode Last part of password reset link
   * @param  {string} email email of the user
   * @param  {string} password the new password for the user
   */
  resetPassword(resetCode, email, password) {
    const reqId = shortid.generate();
    return new User()
      .where({ email })
      .fetch({ withRelated: ['passwordResetRequests'] })
      .then((user) => {
        if (!user) {
          throw errors.UserNotFound('User does not exist');
        }
        const resetRequest = user
          .related('passwordResetRequests')
          .findWhere({ reset_code: resetCode });
        if (!resetRequest) {
          throw new errors.InvalidPasswordResetCode(
            'Password reset link is invalid',
          );
        }
        if (resetRequest.has('used_at')) {
          throw new errors.InvalidPasswordResetCode(
            'Password reset link has already been used',
          );
        }
        if (resetRequest.has('invalidated_at')) {
          throw new errors.InvalidPasswordResetCode(
            'Password reset link in invalid. Use the most recently received link.',
          );
        }
        logger.info(`Request ID: ${reqId} - Resetting password for ${email}`);
        return userService
          .hashPasswordAndSaveDetails(
            user,
            { password },
            user.serialize(),
            reqId,
          )
          .then((updatedUser) => {
            logger.info(
              `Request ID: ${reqId} - Successfully reset password for ${email}`,
            );
            return resetRequest
              .save({ used_at: new Date() }, { patch: true })
              .then(() => {
                return omit(updatedUser.serialize(), [
                  'password',
                  'passwordResetRequests',
                ]);
              });
          });
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Failed to reset password for ${email}: ${error}`,
        );
        throw error;
      });
  }

  /**
   * Get a password reset request
   *
   * @param  {string} resetCode Last part of password reset link
   */
  getByResetCode(resetCode) {
    const reqId = shortid.generate();
    return new PasswordResetRequest()
      .where({ reset_code: resetCode })
      .fetch()
      .then((resetRequest) => {
        if (!resetRequest) {
          throw new errors.InvalidPasswordResetCode(
            'Password reset link is invalid',
          );
        }
        if (resetRequest.has('used_at')) {
          throw new errors.InvalidPasswordResetCode(
            'Password reset link has already been used',
          );
        }
        if (resetRequest.has('invalidated_at')) {
          throw new errors.InvalidPasswordResetCode(
            'Password reset link in invalid. Use the most recently received link.',
          );
        }
        logger.info(
          `Request ID: ${reqId} - Fetched password reset request: ${resetRequest.get(
            'id',
          )}`,
        );
        return omit(resetRequest, ['user_id']);
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error fetching password reset request: ${error}`,
        );
        throw error;
      });
  }
}

module.exports = new PasswordResetService();
