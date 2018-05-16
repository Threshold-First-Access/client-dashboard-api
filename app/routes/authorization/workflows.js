const Workflow = require('../../models/workflow');
const { ContextNotFound } = require('../../middlewares/permissions');

function getCompanyId(req) {
  return new Workflow({ id: req.params.workflow_id })
    .fetch({ withRelated: ['product'] })
    .then((model) => {
      if (!model) {
        throw new ContextNotFound('Workflow not found');
      }

      return {
        companyId: model.related('product').get('company_id'),
      };
    });
}

module.exports = {
  getCompanyId,
};
