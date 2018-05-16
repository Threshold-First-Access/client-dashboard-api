const bookshelf = require('../../app/bookshelf');
require('./role');

const Permission = bookshelf.Model.extend({
  tableName: 'permissions',
  hasTimestamps: true,
  hasAudit: true,
  roles() {
    return this.belongsTo('Role');
  },
});

module.exports = bookshelf.model('Permission', Permission);
