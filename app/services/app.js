const crypto = require('crypto');
const uuidV4 = require('uuid/v4');
const Company = require('../models/company');
const errors = require('../errors');

class AppService {
  create(req) {
    const accessKey = crypto
      .createHash('sha256')
      .update(uuidV4())
      .digest('hex');

    const { name, description, companyId } = req.params;
    return new Company({ id: companyId }).fetch().then((company) => {
      if (!company) {
        throw new errors.CompanyNotFound('Company not found');
      }
      return company.related('apps').create(
        {
          id: uuidV4(),
          name,
          description,
          access_key: accessKey,
        },
        {
          method: 'insert',
        },
      );
    });
  }

  getForCompany(req) {
    return new Company({ id: req.params.companyId })
      .fetch({
        withRelated: ['apps'],
      })
      .then((company) => {
        if (!company) {
          throw new errors.CompanyNotFound('Company not found');
        }
        return {
          results: company.related('apps').serialize(),
        };
      });
  }

  destroy(req) {
    return req.app.destroy();
  }
}

module.exports = new AppService();
