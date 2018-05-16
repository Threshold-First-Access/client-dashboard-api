/**
 * Branch model
 */
const bookshelf = require('../bookshelf');

const Branch = bookshelf.Model.extend({
  tableName: 'branches',
  hasTimestamps: true,
  softDelete: true,
  hasAudit: true,
});

module.exports = bookshelf.model('Branch', Branch);
