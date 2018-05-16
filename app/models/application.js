const { at, first } = require('lodash');
const bookshelf = require('../../app/bookshelf');
require('./workflow');
require('./product');
require('./note');
require('./user');
require('./branch');
require('./configuration');
require('./workflow_state');
require('./appraisal_history');

const Application = bookshelf.Model.extend({
  tableName: 'appraisals',
  hasTimestamps: true,
  hasAudit: true,
  softDelete: true,
  uuid: true,
  workflow() {
    return this.belongsTo('Workflow').through('WorkflowState');
  },
  workflow_state() {
    return this.belongsTo('WorkflowState');
  },
  product() {
    return this.belongsTo('Product').through('Workflow');
  },
  notes() {
    return this.hasMany('Note');
  },
  user() {
    return this.belongsTo('User');
  },
  branch() {
    return this.belongsTo('Branch').through('User');
  },
  history() {
    return this.hasMany('AppraisalHistory');
  },
  serialize(options) {
    const application = bookshelf.Model.prototype.serialize.call(this, options);

    if (this.has('data')) {
      application.data = JSON.parse(this.get('data'));
    }
    if (this.has('decision')) {
      application.decision = JSON.parse(this.get('decision'));
    }

    if (application.workflow_state) {
      const workflowState = application.workflow_state;
      if (workflowState.workflow) {
        const workflow = workflowState.workflow;
        workflow.configuration = workflowState.configuration;
        workflow.contract = workflowState.contract;
        workflow.analysisSchema = workflowState.analysisSchema;
        application.workflow = workflow;
      } else if (application.workflow) {
        const workflow = application.workflow;
        workflow.configuration = workflowState.configuration;
        workflow.contract = workflowState.contract;
      }

      delete application.workflow_state;
      delete application.workflow_state_id;
    }

    const schema = first(at(application, 'workflow.configuration.schema'));

    if (schema) {
      const amountDataPath = first(at(schema, 'schema.borrower.amount'));
      if (amountDataPath) {
        const amountDataPathParts = amountDataPath.split('.');
        const amountSchemaPath = [
          'schema',
          amountDataPathParts[0],
          amountDataPathParts[1],
          'properties',
          amountDataPathParts[2],
          'symbol',
        ].join('.');

        application.amount = first(at(application.data, amountDataPath));
        application.currency = first(at(schema, amountSchemaPath));
      }
      const name = first(
        at(application.data, first(at(schema, 'schema.borrower.name'))),
      );
      if (typeof name === 'object') {
        application.name = [name.firstName, name.middleName, name.lastName]
          .filter(Boolean)
          .join(' ');
      } else {
        application.name = name;
      }
      application.name = application.name && application.name.trim();
    }

    return application;
  },
});

module.exports = bookshelf.model('Application', Application);
