const addCompanyValidation = require('../validations/company/add_company');
const updateCompanyValidation = require('../validations/company/update_company');
const Joi = require('joi');
const Company = require('../../app/models/company');
const { ContextNotFound } = require('../middlewares/permissions');
const authorization = require('./authorization');
const company = require('../controllers/company');

module.exports = (server) => {
  server.post(
    {
      path: '/companies',
      name: 'add_company',
      version: '1.0.0',
      validation: {
        body: addCompanyValidation,
      },
      authorization: {
        permissions: {
          permission: 'CAN_CREATE_COMPANY',
        },
      },
    },
    (req, res, next) => company.create(req, res, next),
  );

  server.get(
    {
      path: '/companies',
      name: 'get_companies',
      version: '1.0.0',
      authorization: authorization.companies.getCompanies,
    },
    (req, res, next) => company.list(req, res, next),
  );

  server.get(
    {
      path: '/companies/:company',
      name: 'get_company',
      version: '1.0.0',
      authorization: {
        permissions: authorization.companies.getCompanies.permissions,
        getRequestContext: (req) =>
          new Company({ slug: req.params.company }).fetch().then((result) => {
            if (!result) {
              throw ContextNotFound('Company not found');
            }
            req.company = result;
            return { companyId: result.get('id') };
          }),
      },
    },
    (req, res, next) => company.getBySlug(req, res, next),
  );

  server.patch(
    {
      path: '/companies/:id',
      name: 'update_company',
      version: '1.0.0',
      validation: updateCompanyValidation,
      authorization: {
        permissions: {
          permission: 'CAN_UPDATE_COMPANY',
        },
        getRequestContext: (req) => ({
          companyId: req.params.id,
        }),
      },
    },
    (req, res, next) => company.update(req, res, next),
  );

  server.patch(
    {
      path: '/companies/:company_id/logo',
      name: 'update_company_logo',
      version: '1.0.0',
      validation: {
        params: {
          company_id: Joi.number().required(),
        },
        body: {
          // The data URI must have an image mimeType.
          // The image must be less than 2MB which means that the base64 string should have a
          // maximum of 2 * 1024 * 1024 * 4 / 3 (2796204) characters rounded up to
          // the nearest multiple of 4
          //
          // See: https://stackoverflow.com/a/13378842/4569129
          logoDataUri: Joi.string()
            .regex(/^data:image\/[\w\+]+;base64,[A-Z\/\.]{0,2796204}/)
            .required(),
        },
      },
      authorization: {
        permissions: {
          permission: 'CAN_UPDATE_COMPANY',
        },
        getRequestContext: (req) => ({
          companyId: req.params.company_id,
        }),
      },
    },
    (req, res, next) => company.updateLogo(req, res, next),
  );

  server.del(
    {
      path: '/companies/:company_id',
      name: 'delete_company',
      authorization: {
        permissions: {
          permission: 'CAN_DELETE_COMPANY',
        },
      },
    },
    (req, res, next) => company.delete(req, res, next),
  );
};
