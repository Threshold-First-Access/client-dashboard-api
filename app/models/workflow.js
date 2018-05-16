const bookshelf = require('../bookshelf');

require('./product');
require('./application');
require('./configuration');
require('./contract');
require('./workflow_state');

const Workflow = bookshelf.Model.extend({
  tableName: 'workflows',
  hasTimestamps: true,
  softDelete: true,
  hasAudit: true,
  uuid: true,
  product() {
    return this.belongsTo('Product');
  },
  applications() {
    return this.hasMany('Application');
  },
  workflow_states() {
    return this.hasMany('WorkflowState');
  },
  configurations() {
    return this.belongsToMany('Configuration').through('WorkflowState');
  },
  contract() {
    return this.belongsToMany('Contract').through('WorkflowState');
  },
  serialize(options = {}) {
    const opts = Object.assign({}, options, {
      omitPivot: options.omitPivot || true,
    });

    const workflow = bookshelf.Model.prototype.serialize.call(this, opts);

    workflow.workflow_state_id = null;

    if (Array.isArray(workflow.workflow_states)) {
      const state = workflow.workflow_states.find((s) => s.end_date == null);
      if (state) {
        const {
          configuration,
          configuration_id: configurationId,
          contract,
          contract_id: contractId,
        } = state;

        // We have to set the configuration_id, contract_id, configuration and
        // contract fields for legacy reasons
        workflow.configuration_id = configurationId;
        workflow.configuration = configuration;

        workflow.contract_id = contractId;
        workflow.contract = contract;

        // For configurations and contracts we have to set the workflow_id
        // field for legacy reasons
        if (configuration) {
          configuration.workflow_id = workflow.id;
        }

        if (Array.isArray(workflow.configurations)) {
          workflow.configurations = workflow.configurations.map((c) => {
            return Object.assign({}, c, { workflow_id: workflow.id });
          });
        }

        if (contract) {
          contract.workflow_id = workflow.id;
        }

        if (Array.isArray(workflow.contracts)) {
          workflow.contracts = workflow.contracts.map((c) => {
            return Object.assign({}, c, { workflow_id: workflow.id });
          });
        }

        workflow.workflow_state_id = state.id;
      }
    }
    delete workflow.workflow_states;
    return workflow;
  },
});

module.exports = bookshelf.model('Workflow', Workflow);
