const axios = require('axios');

const REPORTING_API =
  process.env.NODE_ENV === 'test'
    ? 'https://mock-reporting-api.localdomain'
    : process.env.REPORTING_API;

module.exports = {
  /**
   * Get reports from reporting API
   */
  getReports(req) {
    let endpoint = `${REPORTING_API}/v1/reports`;
    const { body = {} } = req;

    if (body.reportUrl) {
      endpoint = `${REPORTING_API}${req.body.reportUrl}`;
    }

    return axios({
      method: 'POST',
      url: endpoint,
      data: {
        requester: {
          company: req.params.company_id,
          user: req.user.id,
          branch: req.user.branch_id,
          subscription: 'basecamp',
        },
        filters: body.filters,
      },
    });
  },
};
