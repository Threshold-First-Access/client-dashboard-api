const addRoleValidation = require('../validations/role/add_role');
const addUserToRoleValidation = require('../validations/role/add_user');
const addPermissionToRoleValidation = require('../validations/role/add_permissions');
const Role = require('../models/role');
const User = require('../models/user');
const { ContextNotFound } = require('../middlewares/permissions');
const role = require('../controllers/role');

function defaultGetRoleRequestContext(req) {
  return new Role({ id: req.params.id }).fetch().then((result) => {
    if (!result) {
      throw new ContextNotFound('Role not found');
    }
    req.role = result;
    return { companyId: result.get('company_id') };
  });
}

module.exports = (server) => {
  server.post(
    {
      path: '/roles',
      name: 'add_role',
      version: '1.0.0',
      validation: {
        body: addRoleValidation,
      },
      authorization: {
        permissions: {
          permission: 'CAN_CREATE_ROLE',
        },
        getRequestContext: (req) => ({
          companyId: req.body.company_id,
        }),
      },
    },
    (req, res, next) => role.create(req, res, next),
  );

  server.get(
    {
      path: '/roles',
      name: 'get_roles',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_GET_ROLES',
        },
      },
    },
    (req, res, next) => role.list(req, res, next),
  );

  server.get(
    {
      path: '/companies/:company_id/roles',
      name: 'company_roles',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_GET_ROLES',
        },
        getRequestContext: (req) => ({
          companyId: req.params.company_id,
        }),
      },
    },
    (req, res, next) => role.listByCompany(req, res, next),
  );

  server.get(
    {
      path: '/roles/application',
      name: 'application_roles',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_GET_ROLES',
        },
      },
    },
    (req, res, next) => role.listApplicationRoles(req, res, next),
  );

  server.del(
    {
      path: '/roles/:id',
      name: 'delete_role',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_DELETE_ROLE',
        },
        getRequestContext: defaultGetRoleRequestContext,
      },
    },
    (req, res, next) => role.delete(req, res, next),
  );

  server.get(
    {
      path: '/roles/:id',
      name: 'get_role',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_GET_ROLES',
        },
        getRequestContext: defaultGetRoleRequestContext,
      },
    },
    (req, res, next) => role.get(req, res, next),
  );

  server.post(
    {
      path: '/roles/:id/permissions',
      name: 'add_role_permissions',
      version: '1.0.0',
      validation: {
        body: addPermissionToRoleValidation,
      },
      authorization: {
        permissions: {
          permission: 'CAN_ADD_PERMISSION_TO_ROLE',
        },
        getRequestContext: defaultGetRoleRequestContext,
      },
    },
    (req, res, next) => role.addPermissions(req, res, next),
  );

  server.get(
    {
      path: '/roles/:role_id/available_permissions',
      name: 'get_available_permissions',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_GET_ROLES',
        },
        getRequestContext: defaultGetRoleRequestContext,
      },
    },
    (req, res, next) => role.listAvailablePermissions(req, res, next),
  );

  server.post(
    {
      path: '/roles/:id/users/:user_id',
      name: 'add_role_user',
      version: '1.0.0',
      validation: {
        body: addUserToRoleValidation,
      },
      authorization: {
        permissions: {
          permission: 'CAN_ADD_USER_TO_ROLE',
        },
        getRequestContext: (req) =>
          new User({ id: req.params.user_id }).fetch().then((result) => {
            if (!result) {
              throw new ContextNotFound('User not found');
            }
            req.targetUser = result;
            return {
              companyId: result.get('company_id'),
              branchId: result.get('branch_id'),
            };
          }),
      },
    },
    (req, res, next) => role.addUser(req, res, next),
  );

  server.get(
    {
      path: '/permissions',
      name: 'permissions',
      version: '1.0.0',
    },
    (req, res, next) => role.permissions(req, res, next),
  );
};
