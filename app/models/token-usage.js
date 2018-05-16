const bookshelf = require('../bookshelf');

const TokenUsage = bookshelf.Model.extend({
  tableName: 'token_usage_log',
  parse(response) {
    if (response.request) {
      response.request = JSON.parse(response.request);
    }
    return response;
  },
  format(attributes) {
    if (attributes) {
      attributes.request = JSON.stringify(attributes.request);
    }
    return attributes;
  },
});

module.exports = bookshelf.model('TokenUsage', TokenUsage);
