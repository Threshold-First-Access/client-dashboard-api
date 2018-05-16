const httpStatus = require('http-status');
const errors = require('../../app/errors');
const companyService = require('../services/company');

class CompanyController {
  /**
   * Create a new company
   * @param {Object} req Restify request object contains name,company
   * @param {Object} res Restify response object
   */
  create(req, res, next) {
    companyService
      .create(req)
      .then((data) => res.send(httpStatus.CREATED, data))
      .catch((error) => {
        if (error instanceof errors.CompanyAlreadyCreated) {
          res.send(httpStatus.BAD_REQUEST, error);
        } else {
          res.send(
            httpStatus.INTERNAL_SERVER_ERROR,
            new errors.InternalServerError('Internal Server Error'),
          );
        }
      })
      .then(() => next());
  }

  /**
   * Update an existing company
   * @param {Object} req Restify request object contains id and optionally name,company
   * @param {Object} res Restify response object
   */
  update(req, res, next) {
    companyService
      .update(req)
      .then((data) => res.send(httpStatus.OK, data))
      .catch((error) => {
        if (error instanceof errors.CompanyAlreadyCreated) {
          res.send(httpStatus.BAD_REQUEST, error);
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

  getBySlug(req, res, next) {
    companyService
      .getBySlug(req)
      .then((data) => res.send(httpStatus.OK, data))
      .catch(() => {
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Get all companies
   * @param {Object} req Restify request object
   * @param {Object} res Restify response object
   */
  list(req, res, next) {
    companyService
      .list()
      .then((data) => res.send(httpStatus.OK, data))
      .catch((error) => {
        if (error instanceof errors.CompanyNotFound) {
          res.send(httpStatus.NOT_FOUND, error);
        }
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Update a company's logo
   *
   * @param {Object} req Restify request object
   * @param {Number} req.params.company_id Id of company whose logo to update
   * @param {string} req.body.logoDataUri Id of company whose logo to update
   * @param {Object} req.user User making this request
   * @param {Object} res Restify response object
   */
  updateLogo(req, res, next) {
    const { company_id: companyId } = req.params;
    const { logoDataUri } = req.body;
    companyService
      .updateLogo(companyId, logoDataUri, req.user)
      .then((data) => res.send(httpStatus.OK, data))
      .catch((error) => {
        if (error instanceof errors.CompanyNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  delete(req, res, next) {
    companyService
      .delete(req)
      .then((result) => res.send(httpStatus.OK, result))
      .catch((error) => {
        if (error instanceof errors.CompanyNotFound) {
          res.send(httpStatus.NOT_FOUND, error);
        }
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }
}
module.exports = new CompanyController();
