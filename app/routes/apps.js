const Joi = require('joi');
const AppController = require('../controllers/app');
const App = require('../models/app');
const { ContextNotFound } = require('../middlewares/permissions');

module.exports = (server) => {
  server.post(
    {
      path: '/companies/:companyId/apps',
      name: 'create_app',
      version: '1.0.0',
      validation: {
        body: Joi.object()
          .keys({
            name: Joi.string()
              .max(255)
              .required(),
            description: Joi.string().max(255),
          })
          .required(),
      },
      authorization: {
        permissions: {
          permission: 'CAN_CREATE_API_CLIENT_APP',
        },
        getRequestContext: (req) => ({
          companyId: req.params.companyId,
        }),
      },
    },
    (req, res, next) => AppController.create(req, res, next),
  );

  server.get(
    {
      path: '/companies/:companyId/apps',
      name: 'get_apps_for_company',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_GET_API_CLIENT_APPS',
        },
        getRequestContext: (req) => ({
          companyId: req.params.companyId,
        }),
      },
    },
    (req, res, next) => AppController.getForCompany(req, res, next),
  );

  server.del(
    {
      path: '/apps/:appId',
      name: 'delete_app',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_DELETE_API_CLIENT_APP',
        },
        getRequestContext: (req) => {
          return new App({ id: req.params.appId }).fetch().then((app) => {
            if (!app) {
              throw new ContextNotFound('Client app not found');
            }
            req.app = app;
            return {
              companyId: app.get('company_id'),
            };
          });
        },
      },
    },
    (req, res, next) => AppController.destroy(req, res, next),
  );
};
