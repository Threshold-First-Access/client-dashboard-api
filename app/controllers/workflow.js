const httpStatus = require('http-status');
const errors = require('../errors');
const pick = require('lodash/pick');
const workflowService = require('../services/workflow');

class WorkflowController {
  /**
   * Add a workflow to a product
   *
   * @param  {Object} req Restify request object
   * @param  {Object} res Restify response object
   */
  create(req, res, next) {
    const newWorkflow = Object.assign(
      { product_id: req.params.product_id },
      pick(req.body, ['name', 'slug', 'test_mode_enabled']),
    );
    workflowService
      .create(newWorkflow, req.user)
      .then((workflow) => {
        res.send(httpStatus.CREATED, workflow);
      })
      .catch((error) => {
        if (error instanceof errors.ProductNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof errors.DuplicateSlug) {
          return res.send(httpStatus.CONFLICT, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Get all workflows belonging to a product
   *
   * @param  {Object} req Restify request object
   * @param  {Object} res Restify response object
   */
  list(req, res, next) {
    workflowService
      .list(req.params.product_id)
      .then((workflows) => {
        res.send(httpStatus.OK, workflows);
      })
      .catch((error) => {
        if (error instanceof errors.ProductNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Get a particular workflow
   *
   * @param  {Object} req Restify request object
   * @param  {Object} res Restify response object
   */
  show(req, res, next) {
    workflowService
      .show(req.params.workflow_id)
      .then((workflow) => {
        res.send(httpStatus.OK, workflow);
      })
      .catch((error) => {
        if (error instanceof errors.WorkflowNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Update a workflow.
   *
   * @param  {Object} req Restify request object
   * @param  {Object} res Restify response object
   */
  update(req, res, next) {
    workflowService
      .update(req.params.workflow_id, req.body, req.user)
      .then((workflow) => res.send(httpStatus.OK, workflow))
      .catch((error) => {
        if (error instanceof errors.WorkflowNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Delete a workflow
   *
   * @param {Object} req Restify request object
   * @param {Object} res Restify response object
   */
  deleteWorkflow(req, res, next) {
    workflowService
      .deleteWorkflow(req.params.workflow_id, req.user)
      .then((workflow) => res.send(httpStatus.OK, workflow))
      .catch((error) => {
        if (error instanceof errors.WorkflowNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }
}

module.exports = new WorkflowController();
