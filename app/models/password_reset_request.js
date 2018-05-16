const bookshelf = require('../bookshelf');

const PasswordResetRequest = bookshelf.Model.extend({
  tableName: 'password_reset_requests',
  hasTimestamps: true,
});

module.exports = bookshelf.model('PasswordResetRequest', PasswordResetRequest);
