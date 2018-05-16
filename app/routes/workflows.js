const validations = require('../validations/workflow/validation');
const workflow = require('../controllers/workflow');
const authorization = require('./authorization');

module.exports = (server) => {
  server.post(
    {
      path: '/products/:product_id/workflows',
      name: 'create_workflow',
      version: '1.0.0',
      validation: validations.createWorkflowValidation(),
      authorization: {
        permissions: {
          permission: 'CAN_CREATE_PRODUCT_WORKFLOW',
          scope: 'application',
        },
      },
    },
    (req, res, next) => workflow.create(req, res, next),
  );

  server.get(
    {
      path: '/products/:product_id/workflows',
      name: 'list_workflows',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_GET_PRODUCT_WORKFLOWS',
          scope: 'application',
        },
      },
    },
    (req, res, next) => workflow.list(req, res, next),
  );

  server.get(
    {
      path: '/workflows/:workflow_id',
      name: 'show_workflow',
      version: '1.0.0',
      authorization: {
        permissions: {
          anyOf: [
            {
              permission: 'CAN_GET_PRODUCT_WORKFLOWS',
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
    (req, res, next) => workflow.show(req, res, next),
  );

  server.patch(
    {
      path: '/workflows/:workflow_id',
      name: 'update_workflow',
      version: '1.0.0',
      validation: validations.updateWorkflowValidation(),
      authorization: {
        permissions: {
          permission: 'CAN_UPDATE_PRODUCT_WORKFLOW',
          scope: 'application',
        },
      },
    },
    (req, res, next) => workflow.update(req, res, next),
  );

  server.del(
    {
      path: '/workflows/:workflow_id',
      name: 'delete_workflow',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_DELETE_PRODUCT_WORKFLOW',
          scope: 'application',
        },
      },
    },
    (req, res, next) => workflow.deleteWorkflow(req, res, next),
  );
};
