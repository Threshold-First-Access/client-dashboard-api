const StatsD = require('hot-shots');
const logger = require('../logger');

/**
 * Construct a middleware component that sends metrics to the given target.
 * Supported targets are:
 *    - Datadog
 *    - StatsD
 *    - Telegraf
 * These are implemented by hot-shots. See https://github.com/brightcove/hot-shots
 * for configuration options.
 *
 * @param {object} [options] a set of options used to configure the stats receiver.
 * @see {@link https://github.com/brightcove/hot-shots|hot-shots}
 */
function metricsHandler(options) {
  const client = new StatsD(options);
  const statName = 'client_dashboard.api.requests';

  return function(req, res, next) {
    if (!req.extStartTime) {
      req.extStartTime = new Date();
    }

    const end = res.end;
    res.end = function(chunk, encoding) {
      res.end = end;
      res.end(chunk, encoding);

      // Measure the time it spent in the request in ms
      const duration = new Date() - req.extStartTime;
      logger.debug(`response time: ${duration}`);

      if (!req.route || !req.route.path) {
        logger.debug('only recording metrics for routes.');
        return;
      }

      const tags = [
        `route:${req.route.path}`,
        `method:${req.method.toLowerCase()}`,
        `response_code:${res.statusCode}`,
        `version:v1`,
      ];

      client.increment(`${statName}.response_code.${res.statusCode}`, 1, tags);
      client.increment(`${statName}.response_code.all`, 1, tags);

      client.histogram(`${statName}.response_time`, duration, 1, tags);
    };

    // Pass on to next method chain
    next();
  };
}

module.exports = (options = {}) => {
  return metricsHandler(options);
};
