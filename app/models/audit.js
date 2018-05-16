/**
 * Audit model
 *
 * This model holds the relationship between the audit table and transactions performed.
 */

const bookshelf = require('../../app/bookshelf');

const TransactionAudit = bookshelf.Model.extend({
  tableName: 'transaction_audit',
  hasTimestamps: true,
});

module.exports = bookshelf.model('TransactionAudit', TransactionAudit);
