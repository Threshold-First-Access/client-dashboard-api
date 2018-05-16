const RequestLogEntry = require('../models/request_log_entry');
const logger = require('../logger');

function requestLogger(req, res) {
  new RequestLogEntry()
    .save({
      timestamp: req.date(),
      method: req.method,
      path: req.getPath(),
      query: req.getQuery() ? req.query : null,
      status_code: res.statusCode,
      duration_ms: Date.now() - req.time(),
      api_version: req.version(),
      user_agent: req.userAgent(),
      ip: req.sourceIp,
      company_id: req.user && req.user.company_id,
      auth_user_id: req.user && req.user.id,
      auth_app_id: req.faAuth && req.faAuth.clientId,
      auth_type: req.faAuth && req.faAuth.type,
      auth_token: req.faAuth && req.faAuth.token,
    })
    .catch((error) => {
      logger.error(`Failed to log request: ${error.stack}`);
    });
}

module.exports = requestLogger;
