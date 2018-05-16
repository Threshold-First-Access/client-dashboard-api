const httpStatus = require('http-status');
const AuditService = require('../services/audit');
const errors = require('../../app/errors');

class LogController {
  /**
   * Get Audit logs
   *
   * @param  {req} req  Request object
   * @param  {res} res  Response object
   */
  list(req, res, next) {
    AuditService.list(req)
      .then((result) => res.send(httpStatus.OK, result))
      .catch(() =>
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        ),
      )
      .then(() => next());
  }
}

module.exports = new LogController();
