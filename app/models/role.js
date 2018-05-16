const bookshelf = require('../../app/bookshelf');
require('./permission');
require('./user');

const Role = bookshelf.Model.extend(
  {
    tableName: 'roles',
    hasTimestamps: true,
    hasAudit: true,
    permissions() {
      return this.hasMany('Permission');
    },
    users() {
      return this.belongsToMany('User');
    },
  },
  { dependents: ['permissions'] },
);

module.exports = bookshelf.model('Role', Role);
