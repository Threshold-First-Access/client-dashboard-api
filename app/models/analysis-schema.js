const bookshelf = require('../bookshelf');

const AnalysisSchema = bookshelf.Model.extend({
  tableName: 'analysis_schemas',
  hasTimestamps: true,
  hasAudit: true,
  uuid: true,
});

module.exports = bookshelf.model('AnalysisSchema', AnalysisSchema);
