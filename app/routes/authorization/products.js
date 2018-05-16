module.exports = {
  getProducts: {
    permissions: {
      anyOf: [
        {
          permission: 'CAN_GET_COMPANY_PRODUCTS',
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
    getRequestContext: (req) => ({
      companyId: req.params.company_id,
    }),
  },
};
