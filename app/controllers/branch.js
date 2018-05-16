const httpStatus = require('http-status');
const errors = require('../errors');
const branchService = require('../services/branch');

class BranchController {
  /**
   * Get company branches by company ID
   *
   * @param {Object} req Restify request object
   * @param {Object} res Restify response object
   */
  listByCompany(req, res, next) {
    branchService
      .listByCompany(req.params.company_id)
      .then((branches) => res.send(httpStatus.OK, branches))
      .catch(() => {
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Create a branch
   *
   * @param {Object} req Restify request object
   * @param {Object} res Restify response object
   */
  create(req, res, next) {
    branchService
      .create(req)
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

  /**
   * Update a company branch
   *
   * @param {Object} req Restify request object
   * @param {Object} res Restify response object
   */
  update(req, res, next) {
    branchService
      .update(req)
      .then((branch) => res.send(httpStatus.OKAY, branch))
      .catch(() => {
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Deletes a company branch
   *
   * @param {Object} req restify request object
   * @param {Object} res restify response object
   */
  remove(req, res, next) {
    branchService
      .remove(req)
      .then((result) => res.send(result))
      .catch((error) => {
        if (error instanceof errors.BranchNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        } else if (error instanceof errors.BranchHasActiveUsers) {
          return res.send(httpStatus.NOT_ACCEPTABLE, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }
}

module.exports = new BranchController();
