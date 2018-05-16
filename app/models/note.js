const bookshelf = require('../../app/bookshelf');
require('./application');

const Note = bookshelf.Model.extend({
  tableName: 'notes',
  hasTimestamps: true,
  hasAudit: true,
  application() {
    return this.belongsTo('Application');
  },
});

module.exports = bookshelf.model('Note', Note);
