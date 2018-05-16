const httpStatus = require('http-status');

const logger = require('../logger');
const errors = require('../../app/errors');
const applicationService = require('../services/application');

class ApplicationController {
  /**
   * Saves a loan application
   *
   * @param {Object} req request object
   * @param {Object} res response object
   */
  create(req, res, next) {
    applicationService
      .create(req)
      .then((data) => res.send(httpStatus.CREATED, data))
      .catch((error) => {
        if (error instanceof errors.WorkflowNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof errors.InvalidParams) {
          return res.send(httpStatus.BAD_REQUEST, error);
        }
        if (error instanceof errors.UnsupportedProduct) {
          return res.send(httpStatus.BAD_REQUEST, error);
        }
        if (error instanceof errors.ActionForbidden) {
          return res.send(httpStatus.FORBIDDEN, error);
        }
        if (error instanceof errors.InvalidAppraisal) {
          return res.send(httpStatus.BAD_REQUEST, {
            message: JSON.parse(error.message),
          });
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  list(req, res, next) {
    applicationService
      .list(req)
      .then((data) => res.send(httpStatus.OK, data))
      .catch(() => {
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  listInfo(req, res, next) {
    applicationService
      .listInfo(req)
      .then((info) => res.send(httpStatus.OK, info))
      .catch(() => {
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  get(req, res, next) {
    applicationService
      .get(req.params.application_id)
      .then((data) => res.send(httpStatus.OK, data))
      .catch((error) => {
        if (error instanceof errors.ApplicationNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  update(req, res, next) {
    applicationService
      .update(req)
      .then((data) => res.send(httpStatus.OK, data))
      .catch((error) => {
        if (error instanceof errors.ApplicationNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof errors.InvalidDecisionObject) {
          return res.send(httpStatus.BAD_REQUEST, {
            message: error.message,
            errors: error.errors,
          });
        }
        if (error instanceof errors.IncompleteApplication) {
          return res.send(httpStatus.FORBIDDEN, error);
        }
        if (error instanceof errors.CompletedAppraisal) {
          return res.send(httpStatus.BAD_REQUEST, error);
        }
        if (error instanceof errors.InvalidAppraisal) {
          return res.send(httpStatus.BAD_REQUEST, {
            message: JSON.parse(error.message),
          });
        }

        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Saves a note
   *
   * @param {Object} req request object
   * @param {Object} res response object
   */
  saveNote(req, res, next) {
    applicationService
      .saveNote(req, req.user.id)
      .then((data) => res.send(httpStatus.CREATED, data))
      .catch((error) => {
        if (error instanceof errors.ApplicationNotFound) {
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
   * Save and submit a loan appraisal
   *
   * @param {Object} req restify request object
   * @param {Object} res restify response object
   */
  submitNewApplication(req, res, next) {
    applicationService
      .submitNewApplication(req)
      .then((data) => res.send(httpStatus.OK, data))
      .catch((error) => {
        if (error instanceof errors.InvalidAppraisal) {
          return res.send(httpStatus.BAD_REQUEST, {
            message: JSON.parse(error.message),
          });
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Submit a loan application for scoring
   *
   * @param {Object} req restify request object
   * @param {Object} res restify response object
   */
  submitApplication(req, res, next) {
    applicationService
      .submitApplication(req)
      .then((data) => res.send(httpStatus.OK, data))
      .catch((error) => {
        if (error instanceof errors.ApplicationNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof errors.InvalidAppraisal) {
          return res.send(httpStatus.BAD_REQUEST, {
            message: JSON.parse(error.message),
          });
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  remove(req, res, next) {
    applicationService
      .remove(req)
      .then(() => res.send(httpStatus.NO_CONTENT))
      .catch((error) => {
        if (error instanceof errors.ActionForbidden) {
          return res.send(httpStatus.FORBIDDEN, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  clone(req, res, next) {
    applicationService
      .clone(req)
      .then((application) => res.send(application))
      .catch((error) => {
        if (error instanceof errors.IncompleteApplication) {
          return res.send(httpStatus.BAD_REQUEST, error);
        }

        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  reopen(req, res) {
    applicationService
      .reopen(req)
      .then((application) => res.send(application))
      .catch((error) => {
        logger.error(
          ` Request ID: ${
            req.faTraceId
          } - Failed to reopen appraisal: ${error} `,
        );
        if (error instanceof errors.IncompleteApplication) {
          return res.send(httpStatus.BAD_REQUEST, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      });
  }

  download(req, res) {
    applicationService
      .download(req)
      .then((appraisals) => {
        res.header(
          'Content-Disposition',
          'attachment; filename="appraisals.json"',
        );
        res.send(appraisals);
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to download appraisals: ${error}`,
        );
        if (error instanceof errors.InvalidDateRange) {
          return res.send(httpStatus.BAD_REQUEST, error);
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      });
  }
}

module.exports = new ApplicationController();
