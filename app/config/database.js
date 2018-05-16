/* eslint-disable import/no-extraneous-dependencies */

const config = require('../../app/config/config');

const env = process.env.NODE_ENV || 'development';
const DEBUG = env === 'development';

const knex = require('knex')({
  client: 'mysql',
  debug: DEBUG,
  connection: config.mysql.connection[env],
  pool: config.mysql.pool,
});

module.exports = knex;
