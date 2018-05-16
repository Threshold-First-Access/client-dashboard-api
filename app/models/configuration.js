const bookshelf = require('../bookshelf');
require('./workflow');
const logger = require('../logger');

const serialize = bookshelf.Model.prototype.serialize;

const Configuration = bookshelf.Model.extend({
  tableName: 'configurations',
  hasTimestamps: true,
  hasAudit: true,
  uuid: true,
  workflow() {
    return this.belongsTo('Workflow');
  },
  serialize(...rest) {
    const result = serialize.apply(this, rest);
    if (this.has('schema')) {
      try {
        const schema = Buffer.from(this.get('schema'), 'base64').toString();
        result.schema = JSON.parse(schema);
      } catch (error) {
        logger.error(
          `This configuration has an invalid schema: ${this.id}.` +
            `Please update this configuration with valid data.`,
        );
      }
    }
    return result;
  },
});

module.exports = bookshelf.model('Configuration', Configuration);
