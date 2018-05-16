module.exports = {
  getCompanies: {
    permissions: {
      anyOf: [
        {
          permission: 'CAN_GET_COMPANIES',
        },
        {
          permission: 'CAN_UPDATE_COMPANY',
        },
        {
          permission: 'CAN_ADD_USER',
        },
        {
          permission: 'CAN_GET_USERS',
        },
        {
          permission: 'CAN_UPDATE_USER',
        },
        {
          permission: 'CAN_CREATE_ROLE',
        },
        {
          permission: 'CAN_ADD_USER_TO_ROLE',
        },
        {
          permission: 'CAN_ADD_PERMISSION_TO_ROLE',
        },
        {
          permission: 'CAN_GET_ROLES',
        },
        {
          permission: 'CAN_DELETE_ROLE',
        },
        {
          permission: 'CAN_CREATE_COMPANY_BRANCH',
        },
        {
          permission: 'CAN_GET_COMPANY_BRANCHES',
        },
        {
          permission: 'CAN_UPDATE_COMPANY_BRANCH',
        },
        {
          permission: 'CAN_DELETE_COMPANY_BRANCH',
        },
        {
          permission: 'CAN_CREATE_COMPANY_PRODUCT',
        },
        {
          permission: 'CAN_GET_COMPANY_PRODUCTS',
        },
        {
          permission: 'CAN_UPDATE_COMPANY_PRODUCT',
        },
        {
          permission: 'CAN_DELETE_COMPANY_PRODUCT',
        },
        {
          permission: 'CAN_CREATE_PRODUCT_WORKFLOW',
        },
        {
          permission: 'CAN_GET_PRODUCT_WORKFLOWS',
        },
        {
          permission: 'CAN_UPDATE_PRODUCT_WORKFLOW',
        },
        {
          permission: 'CAN_DELETE_PRODUCT_WORKFLOW',
        },
        {
          permission: 'CAN_UPDATE_WORKFLOW_CONFIGURATION',
        },
        {
          permission: 'CAN_GET_WORKFLOW_CONFIGURATION',
        },
        {
          permission: 'CAN_UPDATE_WORKFLOW_CONTRACT',
        },
        {
          permission: 'CAN_GET_WORKFLOW_CONTRACT',
        },
      ],
    },
  },
};
