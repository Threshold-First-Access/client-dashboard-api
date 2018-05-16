const bookshelf = require('../bookshelf');

const Contract = bookshelf.Model.extend({
  tableName: 'contracts',
  hasTimestamps: true,
  hasAudit: true,
  uuid: true,
});

module.exports = bookshelf.model('Contract', Contract);
