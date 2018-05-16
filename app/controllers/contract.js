const httpStatus = require('http-status');
const logger = require('../logger');
const errors = require('../errors');
const yaml = require('js-yaml');
const contractService = require('../services/contract');

class ContractController {
  update(req, res, next) {
    contractService
      .update(req)
      .then((configuration) => res.send(httpStatus.OK, configuration))
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to update the contract for workflow ${
            req.params.workflow_id
          }: ${error.stack}`,
        );

        if (error instanceof errors.WorkflowNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof yaml.YAMLException) {
          return res.send(httpStatus.BAD_REQUEST, {
            message: 'Content is not a valid YAML document',
          });
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  get(req, res, next) {
    contractService
      .get(req)
      .then((configuration) => res.send(httpStatus.OK, configuration))
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to retrieve the contract for workflow ${
            req.params.workflow_id
          }: ${error.stack}`,
        );

        if (error instanceof errors.WorkflowNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof errors.ContractNotFound) {
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

module.exports = new ContractController();
