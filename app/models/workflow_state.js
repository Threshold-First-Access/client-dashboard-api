const bookshelf = require('../../app/bookshelf');

require('./configuration');
require('./contract');
require('./workflow');
require('./application');

const WorkflowState = bookshelf.Model.extend({
  tableName: 'workflow_states',
  hasTimestamps: true,
  uuid: true,
  configuration() {
    return this.belongsTo('Configuration');
  },
  contract() {
    return this.belongsTo('Contract');
  },
  workflow() {
    return this.belongsTo('Workflow');
  },
  applications() {
    return this.hasMany('Application');
  },
  analysisSchema() {
    return this.belongsTo('AnalysisSchema');
  },
});

module.exports = bookshelf.model('WorkflowState', WorkflowState);
