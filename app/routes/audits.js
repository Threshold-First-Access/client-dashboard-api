const audits = require('../controllers/audit');

module.exports = (server) => {
  server.get(
    {
      path: '/audit_logs',
      name: 'get_audit_logs',
      authorization: {
        permissions: {
          permission: 'CAN_GET_LOGS',
          scope: 'application',
        },
      },
    },
    (req, res, next) => audits.list(req, res, next),
  );
};
