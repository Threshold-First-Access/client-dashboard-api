const updateBranchValidation = require('../validations/branch/update_branch');
const addBranchValidation = require('../validations/branch/add_branch');
const Branch = require('../models/branch');
const { ContextNotFound } = require('../middlewares/permissions');
const branch = require('../controllers/branch');

function getRequestContext(req) {
  return new Branch({ id: req.params.branch_id }).fetch().then((model) => {
    if (!model) {
      throw new ContextNotFound('Branch does not exist');
    }
    return {
      companyId: model.get('company_id'),
    };
  });
}
module.exports = (server) => {
  server.post(
    {
      path: '/companies/:company_id/branches',
      name: 'create_branch',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_CREATE_COMPANY_BRANCH',
        },
        getRequestContext: (req) => ({
          companyId: req.params.company_id,
        }),
      },
      validation: addBranchValidation,
    },
    (req, res, next) => branch.create(req, res, next),
  );

  server.get(
    {
      path: '/companies/:company_id/branches',
      name: 'list_branches_by_company',
      version: '1.0.0',
      authorization: {
        permissions: {
          anyOf: [
            {
              permission: 'CAN_GET_COMPANY_BRANCHES',
            },
            {
              permission: 'CAN_GET_USERS',
            },
          ],
        },
        getRequestContext: (req) => ({
          companyId: req.params.company_id,
        }),
      },
    },
    (req, res, next) => branch.listByCompany(req, res, next),
  );

  server.patch(
    {
      path: '/branches/:branch_id',
      name: 'update_branch',
      version: '1.0.0',
      validation: updateBranchValidation,
      authorization: {
        permissions: {
          permission: 'CAN_UPDATE_COMPANY_BRANCH',
        },
        getRequestContext,
      },
    },
    (req, res, next) => branch.update(req, res, next),
  );

  server.del(
    {
      path: '/branches/:branch_id',
      name: 'delete_branch',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_DELETE_COMPANY_BRANCH',
        },
        getRequestContext,
      },
    },
    (req, res, next) => branch.remove(req, res, next),
  );
};
