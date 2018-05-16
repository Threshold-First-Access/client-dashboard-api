const shortid = require('shortid');
const uuidV4 = require('uuid/v4');
const Workflow = require('../models/workflow');
const Product = require('../models/product');
const WorkflowState = require('../models/workflow_state');
const errors = require('../errors');
const _ = require('lodash');
const logger = require('../logger');
const bookshelf = require('../bookshelf');

class WorkflowService {
  /**
   * Add a workflow to a product
   *
   * @param  {Number} productId id of product
   * @param {Object} authUser Authenticated user
   */
  create(newWorkflow, authUser) {
    const reqId = shortid.generate();
    logger.info(
      `Request ID: ${reqId} - Creating workflow ${JSON.stringify(newWorkflow)}`,
    );

    newWorkflow.uuid = uuidV4();

    return bookshelf.transaction((trx) => {
      return new Workflow()
        .save(newWorkflow, { user_id: authUser.id, transacting: trx })
        .then((workflow) => {
          logger.info(
            `Request ID: ${reqId} - Created workflow '${workflow.get(
              'name',
            )}' with id ${workflow.get('id')}`,
          );
          return new WorkflowState()
            .save(
              { workflow_id: workflow.get('id') },
              { user_id: authUser.id, transacting: trx },
            )
            .then(() => workflow.serialize());
        })
        .catch((error) => {
          logger.info(
            `Request ID: ${reqId} - Failed to create workflow: ${error}`,
          );
          switch (error.code) {
            case 'ER_NO_REFERENCED_ROW_2':
              throw new errors.ProductNotFound('Product does not exist');
            case 'ER_DUP_ENTRY':
              throw new errors.DuplicateSlug(
                `Slug '${newWorkflow.slug}' is already in use`,
              );
            default:
              throw error;
          }
        });
    });
  }

  /**
   * Get all workflows belonging to a product
   *
   * @param  {Number} productId id of product
   */
  list(productId) {
    const reqId = shortid.generate();
    return new Product()
      .where({ id: productId })
      .fetch({ withRelated: ['workflows'] })
      .then((product) => {
        if (!product) {
          logger.info(
            `Request ID: ${reqId} - Tried fetching workflows in a non-existent product (ID: ${productId})`,
          );
          throw new errors.ProductNotFound('Product does not exist');
        }
        logger.info(
          `Request ID: ${reqId} - Fetched workflows in product (ID: ${productId})`,
        );
        return product.related('workflows');
      })
      .catch((error) => {
        logger.info(
          `Request ID: ${reqId} - Failed to fetch workflows in product (ID: ${productId})`,
        );
        throw error;
      });
  }

  /**
   * Get a particular workflow and include it's product and company
   *
   * @param  {Number} productId id of product
   */
  show(workflowId) {
    const reqId = shortid.generate();
    return new Workflow()
      .where({ id: workflowId })
      .fetch({ withRelated: ['product.company'] })
      .then((workflow) => {
        if (!workflow) {
          throw new errors.WorkflowNotFound('Workflow not found');
        }
        logger.info(
          `Request ID: ${reqId} - Fetched workflow (ID: ${workflowId})`,
        );
        return workflow;
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Failed to fetch workflow (ID: ${workflowId})`,
        );
        throw error;
      });
  }

  /**
   * Update a workflow
   *
   * @param {Number}  workflowId id of workflow
   * @param {Object} reqBody body of request
   * @param {Object} authUser Authenticated user
   */
  update(workflowId, reqBody, authUser) {
    const reqId = shortid.generate();
    const newProps = _.pick(reqBody, ['name', 'slug', 'test_mode_enabled']);

    return new Workflow()
      .where({ id: workflowId })
      .fetch()
      .then((workflow) => {
        if (!workflow) {
          logger.info(
            `Request ID: ${reqId} - Workflow (ID: ${workflowId}) not found`,
          );
          throw new errors.WorkflowNotFound('Workflow not found');
        }
        return workflow
          .save(newProps, { patch: true, user_id: authUser.id })
          .then((newWorkflow) => {
            logger.info(
              `Request ID: ${reqId} - Updated workflow (ID: ${workflowId})`,
            );
            return newWorkflow.toJSON();
          });
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Failed to update workflow (ID: ${workflowId})`,
        );
        throw error;
      });
  }

  /**
   * Delete workflow
   *
   * @param {Number} workflowId id of workflow
   * @param {O}
   */
  deleteWorkflow(workflowId, authUser) {
    const reqId = shortid.generate();

    logger.info(`Request ID: ${reqId} - Fetching workflow (ID: ${workflowId})`);
    return new Workflow()
      .where({ id: workflowId })
      .fetch()
      .then((workflow) => {
        if (!workflow) {
          logger.error(
            `Request ID: ${reqId} - Workflow (ID: ${workflowId}) not found`,
          );
          throw new errors.WorkflowNotFound('Workflow not found');
        }

        logger.info(
          `Request ID: ${reqId} - Deleting workflow (ID: ${workflowId})`,
        );
        return workflow.destroy({ user_id: authUser.id }).then(() => {
          logger.info(
            `Request ID: ${reqId} - Workflow (ID: ${workflowId}) deleted`,
          );
          return { message: 'Workflow deleted successfully', id: workflowId };
        });
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Failed to delete workflow (ID: ${workflowId})`,
        );
        throw error;
      });
  }

  /**
   * Update the workflow state of a workflow. This involves setting the end_date
   * of the active workflow state and creating a new one with the values of
   * the previously active state expect those that will be updated according
   * to `stateUpdate`
   *
   * This is a wrapper for {@link updateWorkflowStateInTransaction} to allow
   * `options.trx` to be optional
   * @param  {string} workflowId  id of the workflow whose workflow state to update
   * @param  {Object} stateUpdate the workflow state attributes to update.
   *                              The updatable attributes are: configurationId,
   *                              contractId and analysisSchemaId
   * @param  {Object} options     options
   * @param  {string} options.userId  id of authenticated user
   * @param  {Object} [options.trx]   the transaction in which to perform the workflow
   *                                  state up
   * @return {Promise} promise that resolves with the updated workflow state
   */
  updateWorkflowState(workflowId, stateUpdate, options) {
    if (options.trx) {
      return this.updateWorkflowStateInTransaction(
        workflowId,
        stateUpdate,
        options,
      );
    }
    return bookshelf.transaction((trx) => {
      return this.updateWorkflowStateInTransaction(
        workflowId,
        stateUpdate,
        Object.assign({}, options, { trx }),
      );
    });
  }

  /**
   * Update the workflow state of a workflow. This involves setting the end_date
   * of the active workflow state and creating a new one with the values of
   * the previously active state expect those that will be updated according
   * to `stateUpdate`
   *
   * @param  {string} workflowId  id of the workflow whose workflow state to update
   * @param  {Object} stateUpdate the workflow state attributes to update.
   *                              The updatable attributes are: configurationId,
   *                              contractId and analysisSchemaId
   * @param  {Object} options     options
   * @param  {string} options.userId  id of authenticated user
   * @param  {Object} options.trx   the transaction in which to perform the workflow
   *                                  state up
   * @return {Promise} promise that resolves with the updated workflow state
   */
  updateWorkflowStateInTransaction(workflowId, stateUpdate, { userId, trx }) {
    return new WorkflowState()
      .where({ workflow_id: workflowId, end_date: null })
      .fetch({ transacting: trx })
      .then((workflowState) => {
        /* Every workflow should have a workflow state whose `end_date` is null
        So if no such workflow state exists for a certain workflow id,
        we can conclude that there's no workflow with that id. */
        if (!workflowState) {
          throw new errors.WorkflowNotFound('Workflow not found');
        }
        return workflowState;
      })
      .then((workflowState) => {
        return workflowState.save(
          { end_date: new Date() },
          {
            transacting: trx,
            patch: true,
            user_id: userId,
          },
        );
      })
      .then((prevWorkflowState) => {
        const { contractId, configurationId, analysisSchemaId } = stateUpdate;
        return new WorkflowState().save(
          {
            workflow_id: workflowId,
            start_date: prevWorkflowState.get('end_date'),
            end_date: null,
            contract_id: contractId || prevWorkflowState.get('contract_id'),
            configuration_id:
              configurationId || prevWorkflowState.get('configuration_id'),
            analysis_schema_id:
              analysisSchemaId || prevWorkflowState.get('analysis_schema_id'),
          },
          {
            transacting: trx,
            user_id: userId,
          },
        );
      });
  }
}

module.exports = new WorkflowService();
