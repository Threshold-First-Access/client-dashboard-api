const httpStatus = require('http-status');
const errors = require('../errors');
const logger = require('../logger');
const TokenService = require('../services/token');

class TokenController {
  create(req, res, next) {
    TokenService.create(req)
      .then((token) => {
        res.send(httpStatus.CREATED, token);
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to generate personal access token: ${error.stack}`,
        );
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

  getForUser(req, res, next) {
    TokenService.getForUser(req)
      .then((tokens) => {
        res.send(httpStatus.OK, tokens);
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to retrieve access tokens for user (${
            req.params.userId
          }): ${error.stack}`,
        );
        if (error instanceof errors.UserNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
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

  delete(req, res, next) {
    TokenService.delete(req)
      .then(() => {
        res.send(httpStatus.NO_CONTENT);
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${
            req.faTraceId
          } - Failed to delete personal access token (${req.params.tokenId}): ${
            error.stack
          }`,
        );
        if (error instanceof errors.TokenNotFound) {
          return res.send(httpStatus.NOT_FOUND, error);
        }
        if (error instanceof errors.ActionForbidden) {
          // Even though the reason for this error is that the user doesn't have access,
          // returning a 404 instead of 403 error hides the details from potentially
          // malicious uses of this endpoint
          return res.send(
            httpStatus.NOT_FOUND,
            new errors.TokenNotFound('Token not found'),
          );
        }
        return res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }
}

module.exports = new TokenController();
