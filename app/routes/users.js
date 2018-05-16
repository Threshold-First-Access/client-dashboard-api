const addUserValidation = require('../validations/user/add_user');
const updateUserValidation = require('../validations/user/update_user');
const getUserForCompany = require('../validations/company/get_users_for_company');
const User = require('../../app/models/user');
const { ContextNotFound } = require('../middlewares/permissions');
const user = require('../controllers/user');

function defaultGetRequestContext(req) {
  return new User({ id: req.params.id }).fetch().then((result) => {
    if (!result) {
      throw new ContextNotFound('User not found');
    }
    req.targetUser = result;
    return {
      companyId: result.get('company_id'),
      branchId: result.get('branch_id'),
      userId: result.get('id'),
    };
  });
}

module.exports = (server) => {
  server.post(
    {
      path: 'users',
      name: 'add_user',
      validation: {
        body: addUserValidation,
      },
      authorization: {
        permissions: {
          permission: 'CAN_ADD_USER',
        },
        getRequestContext: (req) => ({
          companyId: req.body.company_id,
          branchId: req.body.branch_id,
        }),
      },
    },
    (req, res, next) => user.create(req, res, next),
  );

  server.get(
    {
      path: '/companies/:id/users',
      name: 'get_company_users',
      validation: {
        params: getUserForCompany,
      },
      authorization: {
        permissions: {
          anyOf: [
            {
              permission: 'CAN_GET_USERS',
            },
            {
              permission: 'CAN_ADD_USER',
            },
            {
              permission: 'CAN_UPDATE_USER',
            },
          ],
        },
        getRequestContext: (req) => ({
          companyId: req.params.id,
        }),
      },
    },
    (req, res, next) => user.listByCompany(req, res, next),
  );

  server.get(
    {
      path: 'users/application',
      name: 'get_application_users',
      authorization: {
        permissions: {
          permission: 'CAN_GET_USERS',
          scope: 'application',
        },
      },
    },
    (req, res, next) => user.listApplicationUsers(req, res, next),
  );

  server.get(
    {
      path: 'users/:id',
      name: 'get_user',
      authorization: {
        permissions: { permission: 'CAN_GET_USERS' },
        getRequestContext: defaultGetRequestContext,
      },
    },
    (req, res, next) => user.get(req, res, next),
  );

  server.get(
    {
      path: 'users/:id/permissions',
      name: 'get_user_permissions',
      authorization: {
        permissions: { permission: 'CAN_GET_USERS' },
        getRequestContext: defaultGetRequestContext,
      },
    },
    (req, res, next) => user.getPermissions(req, res, next),
  );

  server.patch(
    {
      path: 'users/:id',
      name: 'update_user',
      validation: updateUserValidation,
      authorization: {
        permissions: { permission: 'CAN_UPDATE_USER' },
        getRequestContext: defaultGetRequestContext,
      },
    },
    (req, res, next) => user.update(req, res, next),
  );

  server.post(
    {
      path: 'users/:id/profile_image',
      name: 'upload_user_profile',
      authorization: {
        permissions: { permission: 'CAN_UPDATE_USER' },
        getRequestContext: defaultGetRequestContext,
      },
    },
    (req, res, next) => user.updateProfileImage(req, res, next),
  );
};
