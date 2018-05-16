/**
 * Company model
 *
 * This model holds all the companies data
 */

const bookshelf = require('../../app/bookshelf');
require('./product');
require('./user');
require('./branch');
require('./app');

const Company = bookshelf.Model.extend({
  tableName: 'companies',
  hasTimestamps: true,
  softDelete: true,
  hasAudit: true,
  products() {
    return this.hasMany('Product');
  },
  users() {
    return this.hasMany('User');
  },
  branches() {
    return this.hasMany('Branch');
  },
  apps() {
    return this.hasMany('App');
  },
});

module.exports = bookshelf.model('Company', Company);
