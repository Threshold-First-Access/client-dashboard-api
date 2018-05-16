const bookshelf = require('../../app/bookshelf');
require('./company');
require('./workflow');
require('./configuration');

const Product = bookshelf.Model.extend({
  tableName: 'products',
  hasTimestamps: true,
  softDelete: true,
  hasAudit: true,
  company() {
    return this.belongsTo('Company');
  },
  workflows() {
    return this.hasMany('Workflow');
  },
});

module.exports = bookshelf.model('Product', Product);
