const CompanyService = require('../../app/services/company');

module.exports = {
  /**
   * Create a new company for the test suite
   */
  create() {
    return CompanyService.create({
      name: 'Test Company',
      country: 'TZ',
    });
  },
};
