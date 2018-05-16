/* eslint-disable import/no-extraneous-dependencies */

const config = require('./app/config/config');

const env = process.env.NODE_ENV || 'development';

const dbConfig = {
  client: 'mysql',
  connection: config.mysql.connection[env],
  pool: config.mysql.pool,
  migrations: {
    tableName: 'migrations',
  },
};

/**
 * Database settings.
 *
 * Setting the db settings in knexfile allows us to make use of the migrations.
 *
 * @type {Object} Database settings
 */
module.exports = {
  test: dbConfig,
  development: dbConfig,
  production: dbConfig,
};
