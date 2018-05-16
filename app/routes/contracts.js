const Joi = require('joi');
const contract = require('../controllers/contract');

module.exports = (server) => {
  server.patch(
    {
      path: '/workflows/:workflow_id/contract',
      name: 'update_workflow_contract',
      version: '1.0.0',
      validation: {
        params: {
          workflow_id: Joi.string().required(),
        },
        body: {
          content: Joi.string().required(),
        },
      },
      authorization: {
        permissions: {
          permission: 'CAN_UPDATE_WORKFLOW_CONTRACT',
          scope: 'application',
        },
      },
    },
    (req, res, next) => contract.update(req, res, next),
  );

  server.get(
    {
      path: '/workflows/:workflow_id/contract',
      name: 'get_workflow_contract',
      version: '1.0.0',
      validation: {
        params: {
          workflow_id: Joi.string().required(),
        },
      },
      authorization: {
        permissions: {
          permission: 'CAN_GET_WORKFLOW_CONTRACT',
          scope: 'application',
        },
      },
    },
    (req, res, next) => contract.get(req, res, next),
  );
};
