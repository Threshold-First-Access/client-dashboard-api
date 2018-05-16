const winston = require('winston');
const fs = require('fs');

class Logger {
  /**
   * Generates the timestamp used by the log entries.
   *
   * @returns {number} the timestamp
   */
  static generateTimestamp() {
    return Date.now();
  }

  /**
   * Creates transports based on config values
   *
   * @param {object} config holds configuration for the logger
   * @returns {array} the created transports
   */
  static createTransport(config) {
    const transports = [];

    // setup the file transport
    if (config.file) {
      // create the file
      fs.open(config.file, 'w', (err, fd) => {
        if (err) {
          throw new Error(`Unable to create log file at ${config.file}`);
        }

        fs.chmod(config.file, '755');
        fs.close(fd);
      });

      // setup the log transport
      transports.push(
        new winston.transports.File({
          filename: config.file,
          json: false,
          timestamp: Logger.generateTimestamp(),
          level: config.level,
        }),
      );
    }

    // setup the console transport, because devs don't always want to tail the log file.
    // if config.console is set to true, a console logger will be included.
    if (config.console) {
      transports.push(
        new winston.transports.Console({
          timestamp: Logger.generateTimestamp(),
          level: config.level,
        }),
      );
    }

    return transports;
  }
}

module.exports = {
  /**
   * Creates a new logger instance using the config provided.
   * @param  {object} config The config used to setup the logger transports.
   * @return {logger} Returns a new instance of the winston logger.
   */
  create: (config) =>
    new winston.Logger({ transports: Logger.createTransport(config) }),
};
