const bookshelf = require('../../app/bookshelf');

const RoleUser = bookshelf.Model.extend({
  tableName: 'roles_users',
  hasTimestamps: true,
  hasAudit: true,
});

module.exports = bookshelf.model('RoleUser', RoleUser);
