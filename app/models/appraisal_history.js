const bookshelf = require('../../app/bookshelf');
require('./application');
require('./user');

const AppraisalHistory = bookshelf.Model.extend({
  tableName: 'appraisal_history',
  hasAudit: true,
  uuid: true,
  application() {
    return this.belongsTo('Application');
  },
  user() {
    return this.belongsTo('User');
  },
});

module.exports = bookshelf.model('AppraisalHistory', AppraisalHistory);
