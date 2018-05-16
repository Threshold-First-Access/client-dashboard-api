const httpStatus = require('http-status');

const reports = require('../services/reports');
const errors = require('../../app/errors');
const logger = require('../logger');

module.exports = {
  /**
   * Get reports from reporting API
   *
   * @param {req} req - Restify request object
   * @param {res} res - Restify response object
   */
  getReports(req, res, next) {
    reports
      .getReports(req)
      .then((result) => {
        res.send(httpStatus.OK, result.data);
      })
      .catch((error) => {
        logger.error(
          ` Request ID: ${req.faTraceId} - Failed to fetch reports: ${error} `,
        );
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server error'),
        );
      })
      .then(() => next());
  },
};
