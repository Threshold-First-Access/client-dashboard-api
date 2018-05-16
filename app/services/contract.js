const shortid = require('shortid');
const Contract = require('../models/contract');
const WorkflowState = require('../models/workflow_state');
const errors = require('../errors');
const yaml = require('js-yaml');
const logger = require('../logger');
const bookshelf = require('../bookshelf');
const WorkflowService = require('./workflow');

class ContractService {
  /**
   * Update the contract of a workflow
   *
   * @param  {Object} req request object
   * @param  {string} req.user.id id of authenticated user
   * @param  {string} req.params.workflow_id id of the workflow whose contract to update
   * @param  {string} req.body.content the new YAML for the contract
   * @return {Promise} promise that resolves with the updated contract
   */
  update(req) {
    const workflowId = req.params.workflow_id;
    const userId = req.user.id;
    const contractBody = req.body.content;
    try {
      // attempt to parse the YAML content so that if it's not valid YAML, an error
      // is thrown
      yaml.safeLoad(contractBody);
    } catch (exception) {
      return Promise.reject(exception);
    }

    return bookshelf.transaction((trx) => {
      return new Contract()
        .save({ content: contractBody }, { transacting: trx, user_id: userId })
        .then((contract) => {
          return WorkflowService.updateWorkflowState(
            workflowId,
            { contractId: contract.get('id') },
            { userId, trx },
          ).then(() => {
            /* `workflow_id` as a property of a contract previous relied on
            the column being set in the database table. But that column was
            uncessary because the relationship between a contract and a workflows
            is established via the workflow state.

            In future, it should be deprecated since any client hitting this
            endpoint already has the workflow_id */
            return Object.assign({}, contract.serialize(), {
              workflow_id: workflowId,
            });
          });
        });
    });
  }

  /**
   * Get the contract of a Workflow
   *
   * @param  {Object} req request object
   * @param  {string} req.params.workflow_id id of the workflow whose contract to get
   * @return {Promise} promise that resolves with the requested workflow
   */
  get(req) {
    const reqId = shortid.generate();
    const workflowId = req.params.workflow_id;
    logger.info(`Request ID: ${reqId} - Fetching workflow (ID: ${workflowId})`);
    return new WorkflowState()
      .where({ workflow_id: workflowId, end_date: null })
      .fetch({ withRelated: ['contract'] })
      .then((workflowState) => {
        /* Every workflow should have a workflow state whose `end_date` is null
        So if no such workflow state exists for a certain workflow id,
        we can conclude that there's no workflow with that id. */
        if (!workflowState) {
          throw new errors.WorkflowNotFound('Workflow not found');
        }

        const contract = workflowState.related('contract');
        if (!contract.has('id')) {
          throw new errors.ContractNotFound(
            'Workflow does not have a contract',
          );
        }
        /* `workflow_id` as a property of a contract previous relied on
        the column being set in the database table. But that column was
        uncessary because the relationship between a contract and a workflows
        is established via the workflow state.

        In future, it should be deprecated since any client hitting this
        endpoint already has the workflow_id */
        return Object.assign({}, contract.serialize(), {
          workflow_id: workflowId,
        });
      });
  }
}

module.exports = new ContractService();
