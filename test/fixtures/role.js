const RoleService = require('../../app/services/role');

const permissions = [
  {
    name: 'Create new user',
    permission: 'CAN_ADD_USER',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Create new company user',
    permission: 'CAN_ADD_USER',
    scope: 'company',
    assigned: true,
  },
  {
    name: 'Update user',
    permission: 'CAN_UPDATE_USER',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Update company user',
    permission: 'CAN_UPDATE_USER',
    scope: 'company',
    assigned: true,
  },
  {
    name: 'Create role',
    permission: 'CAN_CREATE_ROLE',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Create company role',
    permission: 'CAN_CREATE_ROLE',
    scope: 'company',
    assigned: true,
  },
  {
    name: 'Add user to role',
    permission: 'CAN_ADD_USER_TO_ROLE',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Add user to role',
    permission: 'CAN_ADD_USER_TO_ROLE',
    scope: 'company',
    assigned: true,
  },
  {
    name: 'Create company',
    permission: 'CAN_CREATE_COMPANY',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Update Company',
    permission: 'CAN_UPDATE_COMPANY',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get companies',
    permission: 'CAN_GET_COMPANIES',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Create company product',
    permission: 'CAN_CREATE_COMPANY_PRODUCT',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get company products',
    permission: 'CAN_GET_COMPANY_PRODUCTS',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Create product workflow',
    permission: 'CAN_CREATE_PRODUCT_WORKFLOW',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get product workflows',
    permission: 'CAN_GET_PRODUCT_WORKFLOWS',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Update a product workflow',
    permission: 'CAN_UPDATE_PRODUCT_WORKFLOW',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Delete a product workflow',
    permission: 'CAN_DELETE_PRODUCT_WORKFLOW',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Update a workflow configuration',
    permission: 'CAN_UPDATE_WORKFLOW_CONFIGURATION',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get a workflow configuration',
    permission: 'CAN_GET_WORKFLOW_CONFIGURATION',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Update a workflow contract',
    permission: 'CAN_UPDATE_WORKFLOW_CONTRACT',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get a workflow contract',
    permission: 'CAN_GET_WORKFLOW_CONTRACT',
    scope: 'application',
    assigned: true,
  },
  {
    name: "Update a workflow's analysis schema",
    permission: 'CAN_UPDATE_WORKFLOW_ANALYSIS_SCHEMA',
    scope: 'application',
    assigned: true,
  },
  {
    name: "Get a workflow's analysis schema",
    permission: 'CAN_GET_WORKFLOW_ANALYSIS_SCHEMA',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get users',
    permission: 'CAN_GET_USERS',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get company users',
    permission: 'CAN_GET_USERS',
    scope: 'company',
    assigned: true,
  },
  {
    name: 'Get company branches',
    permission: 'CAN_GET_COMPANY_BRANCHES',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Create company branch',
    permission: 'CAN_CREATE_COMPANY_BRANCH',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Update company branch',
    permission: 'CAN_UPDATE_COMPANY_BRANCH',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Delete company branch',
    permission: 'CAN_DELETE_COMPANY_BRANCH',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Add permission to role',
    permission: 'CAN_ADD_PERMISSION_TO_ROLE',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get roles',
    permission: 'CAN_GET_ROLES',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Delete role',
    permission: 'CAN_DELETE_ROLE',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get applications',
    permission: 'CAN_GET_APPLICATIONS',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get reports',
    permission: 'CAN_GET_REPORTS',
    scope: 'company',
    assigned: true,
  },
  {
    name: 'Get logs',
    permission: 'CAN_GET_LOGS',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Create personal access tokens',
    permission: 'CAN_CREATE_PERSONAL_ACCESS_TOKENS',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Create API client app',
    permission: 'CAN_CREATE_API_CLIENT_APP',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Get API client apps',
    permission: 'CAN_GET_API_CLIENT_APPS',
    scope: 'application',
    assigned: true,
  },
  {
    name: 'Delete API client app',
    permission: 'CAN_DELETE_API_CLIENT_APP',
    scope: 'application',
    assigned: true,
  },
];

module.exports = {
  /**
   * Create a new role
   */
  create(role) {
    return RoleService.create(role).then((result) => result);
  },

  /**
   * Add permissions to a role.
   *
   * @param  {Integer} roleId   Role ID
   */
  addPermissions(role) {
    return Promise.all(
      permissions.map((permission) =>
        RoleService.addPermissions({
          body: permission,
          params: { id: role.get('id') },
          user: { id: 4 },
          role,
        }),
      ),
    );
  },

  /**
   * Add a user to a role.
   *
   * @param  {Integer} roleId   Role ID
   * @param  {Integer} userId   User ID
   */
  addUser(roleId, user) {
    const data = {
      body: {
        assign: true,
      },
      params: {
        id: roleId,
        user_id: user.get('id'),
      },
      user: {
        id: 4,
      },
      targetUser: user,
    };
    return RoleService.addUser(data);
  },
};
