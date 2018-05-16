const StatsD = require('hot-shots');

module.exports = (options = {}) => {
  return new StatsD(options);
};
