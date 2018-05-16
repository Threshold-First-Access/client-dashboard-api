const logger = require('../library/logging');
const config = require('./config/config');

module.exports = logger.create(config.logging);
