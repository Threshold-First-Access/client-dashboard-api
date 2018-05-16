const Joi = require('joi');

const activation = require('../controllers/activation');

module.exports = (server) => {
  server.post(
    {
      path: 'activation/code',
      name: 'resend_activation_link',
      validation: {
        body: {
          user_id: Joi.number().required(),
          email: Joi.string()
            .email()
            .required(),
        },
      },
    },
    (req, res, next) => activation.resendActivationLink(req, res, next),
  );
};
