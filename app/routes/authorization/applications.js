const Branch = require('../../models/branch');
const User = require('../../models/user');
const Product = require('../../models/product');
const Workflow = require('../../models/workflow');

module.exports = {
  list: () => ({
    permissions: {
      permission: 'CAN_GET_APPLICATIONS',
    },
    getRequestContext: getApplicationsRequestContext,
  }),
};

function getApplicationsRequestContext(req) {
  // By calling array.reduce with this function, you get a value if each
  // item in the array is the same, otherwise, you get null.
  //
  // The use case for that is the when a request only gets applicatins for the same
  // company/branch/user the request context used for permissioning can be set
  // for that scope, otherwise (i.e if a request gets applications across multiple
  // companies/branches/users) the request context for that scope should not be set
  const nullOrEqualValue = (a, b) => (a === b ? a : null);

  function getCompanyIdFromQuery(query) {
    if (Array.isArray(query.company_id)) {
      return query.company_id.reduce(nullOrEqualValue);
    }
    return query.company_id;
  }

  if (req.query.user_id) {
    return new User()
      .where('id', 'in', req.query.user_id)
      .fetchAll()
      .then((users) => {
        if (users.size() === 0) {
          return {};
        }
        return {
          companyId:
            getCompanyIdFromQuery(req.query) ||
            users
              .map((user) => user.get('company_id'))
              .reduce(nullOrEqualValue),
          branchId: users
            .map((user) => user.get('branch_id'))
            .reduce(nullOrEqualValue),
          userId: users.map((user) => user.get('id')).reduce(nullOrEqualValue),
        };
      });
  }

  if (req.query.branch_id) {
    return new Branch()
      .where('id', 'in', req.query.branch_id)
      .fetchAll()
      .then((branches) => {
        if (branches.size() === 0) {
          return {};
        }
        return {
          companyId: branches
            .map((branch) => branch.get('company_id'))
            .reduce(nullOrEqualValue),
          branchId: branches
            .map((branch) => branch.get('id'))
            .reduce(nullOrEqualValue),
        };
      });
  }

  if (req.query.workflow_id) {
    return new Workflow()
      .where('id', 'in', req.query.workflow_id)
      .fetchAll({ withRelated: 'product' })
      .then((workflows) => {
        if (workflows.size() === 0) {
          return {};
        }
        return {
          companyId: workflows
            .map((workflow) => workflow.related('product').get('company_id'))
            .reduce(nullOrEqualValue),
        };
      });
  }

  if (req.query.product_id) {
    return new Product()
      .where('id', 'in', req.query.product_id)
      .fetchAll()
      .then((products) => {
        if (products.size() === 0) {
          return {};
        }
        return {
          companyId: products
            .map((product) => product.get('company_id'))
            .reduce(nullOrEqualValue),
        };
      });
  }

  return {
    companyId: getCompanyIdFromQuery(req.query),
  };
}
