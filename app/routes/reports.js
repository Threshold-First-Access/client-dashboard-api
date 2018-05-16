const reports = require('../controllers/reports');

module.exports = (server) => {
  server.post(
    {
      path: '/companies/:company_id/reports',
      name: 'get_reports',
      authorization: {
        permissions: {
          permission: 'CAN_GET_REPORTS',
        },
        getRequestContext: (req) => ({
          companyId: req.params.company_id,
        }),
      },
    },
    reports.getReports,
  );
};
