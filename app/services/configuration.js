const Configuration = require('../models/configuration');
const WorkflowState = require('../models/workflow_state');
const WorkflowService = require('./workflow');
const errors = require('../errors');
const bookshelf = require('../bookshelf');

class ConfigurationService {
  /**
   * Update the configuration of a workflow
   *
   * @param  {string} workflowId id of workflow whose configuration to update
   * @param  {string} schema new configuration schema as JSON string
   * @param  {Object} currentUser authenticated user
   * @return {Promise} promise that resolves with the updated configuration
   */
  update(workflowId, schema, currentUser) {
    return bookshelf.transaction((trx) => {
      return new Configuration()
        .save(
          {
            schema: Buffer.from(schema).toString('base64'),
          },
          { transacting: trx, user_id: currentUser.id },
        )
        .then((configuration) => {
          return WorkflowService.updateWorkflowState(
            workflowId,
            { configurationId: configuration.get('id') },
            { userId: currentUser.id, trx },
          ).then(() => {
            /* `workflow_id` as a property of a configuration previously relied on
            the column being set in the database table. But that column was
            uncessary because the relationship between a configuration and a workflows
            is established via the workflow state.

            In future, it should be deprecated since any client hitting this
            endpoint already has the workflow_id */
            return Object.assign({}, configuration.serialize(), {
              workflow_id: workflowId,
            });
          });
        });
    });
  }

  /**
   * Get the configuration of a workflow
   *
   * @param  {Number} workflowId id of the workflow whose configuration to get
   * @returns {Promise} promise that resolves with the requested workflow
   */
  get(workflowId) {
    return new WorkflowState()
      .where({ workflow_id: workflowId, end_date: null })
      .fetch({ withRelated: ['configuration'] })
      .then((workflowState) => {
        /* Every workflow should have a workflow state whose `end_date` is null
        So if no such workflow state exists for a certain workflow id,
        we can conclude that there's no workflow with that id. */
        if (!workflowState) {
          throw new errors.WorkflowNotFound('Workflow not found');
        }

        const configuration = workflowState.related('configuration');
        if (!configuration.has('id')) {
          throw new errors.ConfiguratonNotFound(
            'Workflow does not have a configuration',
          );
        }
        /* `workflow_id` as a property of a configuration previously relied on
        the column being set in the database table. But that column was
        uncessary because the relationship between a configuration and a workflows
        is established via the workflow state.

        In future, it should be deprecated since any client hitting this
        endpoint already has the workflow_id */
        return Object.assign({}, configuration.serialize(), {
          workflow_id: workflowId,
        });
      });
  }
}

module.exports = new ConfigurationService();
