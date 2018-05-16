const validators = require('../validations/common');
const Joi = require('joi');
const PasswordReset = require('../controllers/password_reset');

module.exports = (server) => {
  server.post(
    {
      path: '/password_resets',
      name: 'request_password_reset',
      version: '1.0.0',
      requireAuthentication: false,
      validation: {
        body: {
          email: Joi.string()
            .email()
            .required(),
        },
      },
    },
    (req, res, next) => PasswordReset.requestPasswordReset(req, res, next),
  );

  server.post(
    {
      path: '/password_resets/:reset_code',
      name: 'reset_password',
      version: '1.0.0',
      requireAuthentication: false,
      validation: {
        body: {
          email: Joi.string()
            .email()
            .required(),
          password: validators.password.required(),
        },
      },
    },
    (req, res, next) => PasswordReset.resetPassword(req, res, next),
  );

  server.get(
    {
      path: '/password_resets/:reset_code',
      name: 'get_password_reset_request',
      version: '1.0.0',
      requireAuthentication: false,
    },
    (req, res, next) => PasswordReset.getByResetCode(req, res, next),
  );
};
