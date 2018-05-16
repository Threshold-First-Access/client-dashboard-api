const shortid = require('shortid');
const { pick } = require('lodash');
const Product = require('../../app/models/product');
const bookshelf = require('../bookshelf');
const errors = require('../errors');
const logger = require('../logger');

class ProductService {
  /**
   * Create a new product for a company.
   *
   * @param  {object} data  new product object (name, type, company_id)
   */
  create(req) {
    const allowedKeys = [
      'name',
      'type',
      'company_id',
      'active',
      'test_mode_enabled',
    ];
    const reqId = shortid.generate();

    const newProduct = pick(req.body, allowedKeys);
    newProduct.company_id = req.params.company_id;

    return new Product()
      .save(newProduct, { user_id: req.user.id })
      .then((product) => {
        logger.info(
          `Request ID: ${reqId} - New product created. ${JSON.stringify(
            product,
          )}`,
        );
        return product.refresh();
      })
      .catch((error) => {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          throw new errors.CompanyNotFound('Company not found');
        }
        if (error.code === 'ER_DUP_ENTRY') {
          throw new errors.ProductExistsAlready(
            `A product with the name '${
              newProduct.name
            }' exists in the same company`,
          );
        }
        throw error;
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error ${error} creating product: ${error}`,
        );
        throw error;
      });
  }

  /**
   * List workflows with a configuration and contract
   *
   * @param {request} req - Restify request object
   */
  listByCompany(req) {
    return new Product().where({ company_id: req.params.company_id }).fetchAll({
      withRelated: [
        'company',
        {
          workflows: (qb) => {
            qb
              .join(
                'workflow_states',
                'workflow_states.workflow_id',
                '=',
                'workflows.id',
              )
              .whereRaw(
                'workflow_states.configuration_id IS NOT NULL AND workflow_states.contract_id IS NOT NULL',
              );
          },
          'workflows.workflow_states': (qb) => {
            qb.whereRaw('workflow_states.end_date IS NULL');
          },
          'workflows.configurations': (qb) => {
            qb.whereRaw('workflow_states.end_date IS NULL');
          },
        },
        'workflows.workflow_states.configuration',
      ],
    });
  }

  update(req) {
    const reqId = shortid.generate();
    const update = pick(req.body, [
      'name',
      'type',
      'test_mode_enabled',
      'active',
    ]);
    return req.product
      .save(update, { patch: true, user_id: req.user.id })
      .then((product) => {
        logger.info(
          `Request ID: ${reqId} - Product ${req.params.product_id} updated`,
        );
        return product.refresh();
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error updating product ${
            req.params.product_id
          }: ${error.stack}`,
        );
        if (error.code === 'ER_DUP_ENTRY') {
          throw new errors.ProductExistsAlready(
            `A product with the name ${update.name} exists in the same company`,
          );
        }
        throw error;
      });
  }

  delete(req) {
    const reqId = shortid.generate();
    const productId = req.params.product_id;

    return bookshelf.transaction((trx) => {
      trx.user_id = req.user.id;
      return new Product({ id: productId }).fetch().then((product) => {
        if (!product) {
          throw new errors.ProductNotFound('Product does not exist');
        }

        logger.info(
          `Request ID: ${reqId} - Deleting product with id ${productId}`,
        );
        return product.destroy({ transacting: trx });
      });
    });
  }
}

module.exports = new ProductService();
