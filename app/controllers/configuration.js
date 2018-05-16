const httpStatus = require('http-status');
const logger = require('../logger');
const errors = require('../errors');
const configurationService = require('../services/configuration');

class ConfigurationController {
  update(req, res, next) {
    configurationService
      .update(req.params.workflow_id, req.body.configuration, req.user)
      .then((configuration) => res.send(httpStatus.OK, configuration))
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to update the configuration for workflow ${
            req.params.workflow_id
          }: ${error.stack}`,
        );

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

  get(req, res, next) {
    configurationService
      .get(req.params.workflow_id)
      .then((configuration) => res.send(httpStatus.OK, configuration))
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to retrieve the configuration for workflow ${
            req.params.workflow_id
          }: ${error.stack}`,
        );

        if (error instanceof errors.WorkflowNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof errors.ConfiguratonNotFound) {
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

module.exports = new ConfigurationController();
