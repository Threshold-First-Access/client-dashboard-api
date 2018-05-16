const Joi = require('joi');
const CreateProductValidation = require('../validations/create_product');
const Product = require('../../app/models/product');
const { ContextNotFound } = require('../middlewares/permissions');
const authorization = require('./authorization');
const product = require('../controllers/product');

module.exports = (server) => {
  server.post(
    {
      path: '/companies/:company_id/products',
      name: 'add_product',
      version: '1.0.0',
      validation: {
        params: {
          company_id: Joi.number().required(),
        },
        body: CreateProductValidation,
      },
      authorization: {
        permissions: {
          permission: 'CAN_CREATE_COMPANY_PRODUCT',
        },
        getRequestContext: (req) => ({
          companyId: req.params.company_id,
        }),
      },
    },
    (req, res, next) => product.create(req, res, next),
  );

  server.get(
    {
      path: '/companies/:company_id/products',
      name: 'company_products',
      version: '1.0.0',
      authorization: authorization.products.getProducts,
    },
    (req, res, next) => product.listByCompany(req, res, next),
  );

  server.patch(
    {
      path: '/products/:product_id',
      name: 'update_product',
      version: '1.0.0',
      validation: {
        body: {
          name: Joi.string()
            .min(2)
            .required(),
          type: Joi.string()
            .valid(['individual', 'group'])
            .required(),
          test_mode_enabled: Joi.boolean().strict(),
          active: Joi.boolean().strict(),
        },
      },
      authorization: {
        permissions: {
          permission: 'CAN_UPDATE_COMPANY_PRODUCT',
        },
        getRequestContext: (req) =>
          new Product({ id: req.params.product_id }).fetch().then((result) => {
            if (!result) {
              throw ContextNotFound('Product not found');
            }
            req.product = result;
            return { companyId: result.get('company_id') };
          }),
      },
    },
    (req, res, next) => product.update(req, res, next),
  );

  server.del(
    {
      path: '/products/:product_id',
      name: 'delete_product',
      version: '1.0.0',
      authorization: {
        permissions: {
          permission: 'CAN_DELETE_COMPANY_PRODUCT',
        },
      },
    },
    (req, res, next) => product.delete(req, res, next),
  );
};
