const Audit = require('../models/audit');

class AuditService {
  /**
   * Get audit logs list
   *
   * @param {Object} req - Restify request
   */
  list(req) {
    return new Audit()
      .orderBy('created_at', 'DESC')
      .fetchPage({
        page: req.query.page,
        pageSize: req.query.size,
      })
      .then((data) => {
        return new Audit().count('id').then((result) => ({
          data,
          pages: Math.ceil(result / (req.query.size || 10)),
        }));
      });
  }
}

module.exports = new AuditService();
