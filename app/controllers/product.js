const httpStatus = require('http-status');
const errors = require('../../app/errors');
const productService = require('../services/product');
const logger = require('../logger');

class ProductController {
  /**
   * Create a new product for a company
   *
   * @param  {req} req  Request object
   * @param  {res} res  Response object
   */
  create(req, res, next) {
    productService
      .create(req)
      .then((product) => res.send(httpStatus.CREATED, product))
      .catch((error) => {
        if (error instanceof errors.ProductExistsAlready) {
          res.send(httpStatus.CONFLICT, error);
        } else if (error instanceof errors.CompanyNotFound) {
          res.send(httpStatus.NOT_FOUND, error);
        } else {
          res.send(
            httpStatus.INTERNAL_SERVER_ERROR,
            new errors.InternalServerError('Internal Server Error'),
          );
        }
      })
      .then(() => next());
  }

  listByCompany(req, res, next) {
    productService
      .listByCompany(req)
      .then((products) => res.send(httpStatus.OK, products))
      .catch((error) => {
        logger.error(
          `Request ID: ${req.faTraceId}` +
            `Failed to retrieve products: ${error}` +
            `${error.stack}`,
        );
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError(`Internal Server Error: ${error}`),
        );
      })
      .then(() => next());
  }

  update(req, res, next) {
    productService
      .update(req)
      .then((product) => res.send(httpStatus.OK, product))
      .catch((error) => {
        if (error instanceof errors.ProductNotFound) {
          res.send(httpStatus.NOT_FOUND, error);
        } else if (error instanceof errors.ProductExistsAlready) {
          res.send(httpStatus.CONFLICT, error);
        } else {
          res.send(
            httpStatus.INTERNAL_SERVER_ERROR,
            new errors.InternalServerError('Internal Server Error'),
          );
        }
      })
      .then(() => next());
  }

  delete(req, res, next) {
    productService
      .delete(req)
      .then((result) => res.send(httpStatus.OK, result))
      .catch((error) => {
        if (error instanceof errors.ProductNotFound) {
          res.send(httpStatus.NOT_FOUND, error);
        } else {
          res.send(
            httpStatus.INTERNAL_SERVER_ERROR,
            new errors.InternalServerError('Internal Server Error'),
          );
        }
      })
      .then(() => next());
  }
}

module.exports = new ProductController();
