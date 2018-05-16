const httpStatus = require('http-status');
const errors = require('../errors');
const AppService = require('../services/app');

class AppController {
  create(req, res, next) {
    AppService.create(req)
      .then((app) => {
        res.send(httpStatus.CREATED, app);
      })
      .catch((error) => {
        console.log(error);
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

  getForCompany(req, res, next) {
    AppService.getForCompany(req)
      .then((response) => {
        res.send(response);
      })
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

  destroy(req, res, next) {
    AppService.destroy(req)
      .then(() => {
        res.send(httpStatus.NO_CONTENT);
      })
      .catch(() => {
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }
}

module.exports = new AppController();
