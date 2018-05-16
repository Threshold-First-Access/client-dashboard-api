const Joi = require('joi');
const configuration = require('../controllers/configuration');
const authorization = require('./authorization');

module.exports = (server) => {
  server.patch(
    {
      path: '/workflows/:workflow_id/configuration',
      name: 'update_workflow_configuration',
      version: '1.0.0',
      validation: {
        params: {
          workflow_id: Joi.string().required(),
        },
        body: {
          configuration: Joi.string().required(),
        },
      },
      authorization: {
        permissions: {
          permission: 'CAN_UPDATE_WORKFLOW_CONFIGURATION',
          scope: 'application',
        },
      },
    },
    (req, res, next) => configuration.update(req, res, next),
  );

  server.get(
    {
      path: '/workflows/:workflow_id/configuration',
      name: 'get_workflow_configuration',
      version: '1.0.0',
      validation: {
        params: {
          workflow_id: Joi.string().required(),
        },
      },
      authorization: {
        permissions: {
          anyOf: [
            {
              permission: 'CAN_GET_WORKFLOW_CONFIGURATION',
              scope: 'application',
            },
            {
              permission: 'CAN_CREATE_APPLICATION',
              scope: 'company',
            },
          ],
        },
        getRequestContext: authorization.workflows.getCompanyId,
      },
    },
    (req, res, next) => configuration.get(req, res, next),
  );
};
