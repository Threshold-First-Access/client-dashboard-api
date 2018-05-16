const httpStatus = require('http-status');
const errors = require('../errors');
const passwordResetService = require('../services/password_reset');

class PasswordResetController {
  /**
   * Create a password reset request and send a reset email to the user
   *
   * @param  {Object} req Restify request object
   * @param  {Object} res Restify response object
   */
  requestPasswordReset(req, res, next) {
    const message =
      'An email has been sent to your account. Please follow the instructions in the email to reset your password.';
    passwordResetService
      .requestPasswordReset(req.body.email)
      .then(() => {
        res.send(httpStatus.OK, {
          message,
        });
      })
      .catch((error) => {
        if (error instanceof errors.UserNotFound) {
          return res.send(httpStatus.OK, {
            message,
          });
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Reset a user's password
   *
   * @param  {Object} req Restify request object
   * @param  {Object} res Restify response object
   */
  resetPassword(req, res, next) {
    const { reset_code: resetCode } = req.params;
    const { email, password } = req.body;
    passwordResetService
      .resetPassword(resetCode, email, password)
      .then((user) => {
        res.send(httpStatus.OK, user);
      })
      .catch((error) => {
        if (error instanceof errors.UserNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof errors.InvalidPasswordResetCode) {
          return res.send(httpStatus.FORBIDDEN, error);
        }
        if (error instanceof errors.PasswordAlreadyUsed) {
          return res.send(httpStatus.BAD_REQUEST, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Get a password reset request
   *
   * @param  {Object} req Restify request object
   * @param  {Object} res Restify response object
   */
  getByResetCode(req, res, next) {
    const { reset_code: resetCode } = req.params;
    passwordResetService
      .getByResetCode(resetCode)
      .then((resetRequest) => {
        res.send(httpStatus.OK, resetRequest);
      })
      .catch((error) => {
        if (error instanceof errors.InvalidPasswordResetCode) {
          return res.send(httpStatus.FORBIDDEN, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }
}

module.exports = new PasswordResetController();
