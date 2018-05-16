const bookshelf = require('../bookshelf');

const RequestLogEntry = bookshelf.Model.extend({
  tableName: 'request_log',
  parse(response) {
    if (response.query) {
      response.query = JSON.parse(response.query);
    }
    return response;
  },
  format(attributes) {
    if (attributes.query) {
      attributes.query = JSON.stringify(attributes.query);
    }
    return attributes;
  },
});

module.exports = bookshelf.model('RequestLogEntry', RequestLogEntry);
