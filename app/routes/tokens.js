const Joi = require('joi');
const TokenController = require('../controllers/token');

module.exports = (server) => {
  server.post(
    {
      path: '/tokens',
      name: 'create_token',
      version: '1.0.0',
      validation: {
        body: Joi.object()
          .keys({
            description: Joi.string()
              .max(255)
              .required(),
          })
          .required(),
      },
      authorization: {
        permissions: {
          permission: 'CAN_CREATE_PERSONAL_ACCESS_TOKENS',
        },
        getRequestContext: (req) => ({
          companyId: req.user.company_id,
        }),
      },
    },
    (req, res, next) => TokenController.create(req, res, next),
  );

  server.get(
    {
      path: '/users/:userId/tokens',
      name: 'get_tokens_for_user',
      version: '1.0.0',
    },
    (req, res, next) => TokenController.getForUser(req, res, next),
  );

  server.del(
    {
      path: '/tokens/:tokenId',
      name: 'delete_token',
      version: '1.0.0',
    },
    (req, res, next) => TokenController.delete(req, res, next),
  );
};
