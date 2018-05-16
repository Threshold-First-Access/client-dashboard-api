const httpStatus = require('http-status');

const errors = require('../errors');
const activationService = require('../services/activation');

class ActivationController {
  /**
   * Validate activation code
   *
   * @param  {Object} req   Restify request object
   * @param  {Object} res   Reetify response object
   */
  validateActivationCode(req, res, next) {
    const activationCode = req.params.activation_code;

    activationService
      .validateActivationCode(activationCode)
      .then((result) => res.send(200, result))
      .catch((error) => {
        if (error instanceof errors.UserNotFound) {
          return res.send(httpStatus.FORBIDDEN, error);
        } else if (error instanceof errors.UserAlreadyActive) {
          return res.send(httpStatus.NOT_ACCEPTABLE, error);
        } else if (error instanceof errors.ActionForbidden) {
          return res.send(httpStatus.FORBIDDEN, error);
        }

        return res.send(httpStatus.INTERNAL_SERVER_ERROR, error);
      })
      .then(() => next());
  }

  /**
   * Resend the activation invite
   *
   * @param {Object} req - Restify request object
   * @param {Object} res - Restify response object
   */
  resendActivationLink(req, res, next) {
    activationService
      .resendActivationLink(req)
      .then(() => {
        res.send(httpStatus.OKAY, {
          message: 'user account activation link sent',
        });
      })
      .catch((err) => {
        if (err instanceof errors.UserNotFound) {
          res.send(httpStatus.NOT_FOUND, err);
        } else {
          res.send(httpStatus.BAD_REQUEST, err);
        }
      })
      .then(() => next());
  }

  /**
   * Activates a user's account
   *
   * @param  {Object} req   Restify request object
   * @param  {Object} res   Reetify response object
   * */
  activate(req, res, next) {
    activationService
      .activate(req.params.activation_code, req.body)
      .then((result) => res.send(result))
      .catch((error) => {
        if (error instanceof errors.UserNotFound) {
          return res.send(httpStatus.FORBIDDEN, error);
        } else if (error instanceof errors.UserAlreadyActive) {
          return res.send(httpStatus.NOT_ACCEPTABLE, error);
        } else if (error instanceof errors.ActionForbidden) {
          return res.send(httpStatus.FORBIDDEN, error);
        }

        return res.send(httpStatus.INTERNAL_SERVER_ERROR, error);
      })
      .then(() => next());
  }
}

module.exports = new ActivationController();
