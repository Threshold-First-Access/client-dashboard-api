const bookshelf = require('../bookshelf');

const App = bookshelf.Model.extend({
  tableName: 'company_apps',
  hasTimestamps: true,
  softDelete: true,
  uuid: true,
});

module.exports = bookshelf.model('App', App);
