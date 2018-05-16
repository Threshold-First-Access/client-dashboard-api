const knex = require('../config/database');

/* eslint no-underscore-dangle: 0 */
/* eslint prefer-rest-params: 0 */
class Audit {
  /**
   * Class constructor for the audit class
   * @constructor
   */
  constructor() {
    this.tableName = 'transaction_audit';
  }

  /**
   * Get a method that is used for the transaction
   * @param {string} method - Get a method
   */
  action(method) {
    const methods = {
      insert: 'create',
      del: 'delete',
      update: 'update',
    };

    return methods[method];
  }

  /**
   * Store the transaction in the audit log table
   * @param {object} options - Bookshelf transaction object
   * @param {object} model - Bookshelf model
   */
  store(options, model) {
    const data = {};
    data.user_id = options.user_id
      ? options.user_id
      : options.transacting.user_id;
    data.action = this.action(options.query._method);
    data.table = model.tableName;
    data.data =
      options.query._method === 'del'
        ? JSON.stringify(model._previousAttributes)
        : JSON.stringify(model.attributes);
    data.created_at = new Date();
    data.updated_at = new Date();
    return knex(this.tableName).insert(data);
  }

  /**
   * Save item after a certain action
   * @param {object} model - Bookshelf model
   * @param {number} attrs - ID of the last insertion
   * @param {object} options - Bookshelf transaction object
   */
  onAction(model, attrs, options) {
    return this.store(options, model);
  }
}

module.exports = (bookshelf) => {
  const prototype = bookshelf.Model.prototype;
  bookshelf.Model = bookshelf.Model.extend({
    constructor() {
      prototype.constructor.apply(this, arguments);
      if (this.hasAudit) {
        const audit = new Audit();
        this.on('created destroyed updated', (model, attrs, options) => {
          if (attrs.softDelete) {
            return audit.onAction(model, options, attrs);
          }
          return audit.onAction(model, attrs, options);
        });
      }
    },
  });
};
