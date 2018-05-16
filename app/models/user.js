/**
 * User model
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bookshelf = require('../../app/bookshelf');
require('./role');
require('./company');
require('./branch');
require('./password_reset_request');
require('./token');

const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  hasAudit: true,
  hidden: ['password'],
  roles() {
    return this.belongsToMany('Role');
  },
  company() {
    return this.belongsTo('Company');
  },
  branch() {
    return this.belongsTo('Branch');
  },
  passwordResetRequests() {
    return this.hasMany('PasswordResetRequest');
  },
  tokens() {
    return this.hasMany('Token');
  },
  fullName() {
    return `${this.get('first_name')} ${this.get('last_name')}`;
  },

  comparePassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, this.get('password'), (err, isValid) => {
        if (err) {
          return reject(err);
        }
        return resolve(isValid);
      });
    });
  },

  generateToken() {
    return jwt.sign(
      this.pick('id', 'company_id', 'first_name', 'last_name', 'email'),
      process.env.SECRET_KEY,
      {
        expiresIn: '7d',
      },
    );
  },
});

module.exports = bookshelf.model('User', User);
