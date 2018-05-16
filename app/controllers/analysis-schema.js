const httpStatus = require('http-status');
const logger = require('../logger');
const errors = require('../errors');
const analysisSchemaService = require('../services/analysis-schema');

class AnalysisSchemaController {
  update(req, res, next) {
    analysisSchemaService
      .update(req)
      .then((analysisSchema) => res.send(httpStatus.OK, analysisSchema))
      .catch((error) => {
        if (error instanceof errors.WorkflowNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to update the analysis schema for workflow ${
            req.params.workflow_id
          }: ${error.stack}`,
        );

        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Retrieve the latest version of a workflow's analysis schema
   */
  get(req, res, next) {
    analysisSchemaService
      .get(req)
      .then((analysisSchema) => res.send(httpStatus.OK, analysisSchema))
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to retrieve the analysis schema for workflow ${
            req.params.workflow_id
          }: ${error.stack}`,
        );

        if (
          error instanceof errors.WorkflowNotFound ||
          error instanceof errors.AnalysisSchemaNotFound
        ) {
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

module.exports = new AnalysisSchemaController();
