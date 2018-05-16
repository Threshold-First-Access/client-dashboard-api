const bookshelf = require('../bookshelf');
require('./token-usage');

const Token = bookshelf.Model.extend({
  tableName: 'tokens',
  hasTimestamps: true,
  softDelete: true,
  hidden: ['token'],
  usages() {
    return this.hasMany('TokenUsage');
  },
});

module.exports = bookshelf.model('Token', Token);
