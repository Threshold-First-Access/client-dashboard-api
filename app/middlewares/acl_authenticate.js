const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const PermissionService = require('../services/permission');
const User = require('../models/user');
const Token = require('../models/token');
const App = require('../models/app');
const logger = require('../logger');

const SECRET_KEY = process.env.SECRET_KEY;
const invalidPermissions = { mesage: 'Insufficient permissions' };

class AuthenticationError extends Error {
  constructor(mesage) {
    super(mesage);
    this.statusCode = httpStatus.FORBIDDEN;
  }
}

const auth = {
  ifNeeded(authMiddleware) {
    return (req, res, next) => {
      const { requireAuthentication = true } = req.route;
      if (requireAuthentication) {
        return authMiddleware(req, res, next);
      }
      return next();
    };
  },

  /**
   * Restify middleware to parse the authentication token headers and put
   * the token in a req.faAuth object.
   * @param  {Object}   req  Request object
   * @param  {Object}   res  Response object
   * @param  {Function} next callback to forward to next middleware
   * @return {void}
   */
  parseToken(req, res, next) {
    const { authorization = '' } = req.headers;
    const [authenticationType, credentials] = authorization.split(' ');
    if (authenticationType === 'Bearer') {
      req.faAuth = {
        token: credentials,
      };
    } else {
      /* @deprecated */
      req.faAuth = {
        token: req.headers.token || req.params.token,
      };
      logger.warn(
        `Received request with deprecated token header from %s`,
        req.headers['user-agent'],
      );
    }
    if (req.faAuth.token) {
      next();
    } else {
      next(new AuthenticationError('No token provided.'));
    }
  },

  /**
   * Restify middleware to verify that the token in req.faAuth.token is a
   * valid JWT token and update the req.faAuth object with the decoded payload
   * and the id of the user the token belongs to.
   * @param  {Object}   req  Request object
   * @param  {Object}   res  Response object
   * @param  {Function} next callback to forward to the next middleware
   * @return {void}
   */
  verifyJwt(req, res, next) {
    if (req.faAuth.userId || req.faAuth.clientId) {
      return next();
    }
    return jwt.verify(req.faAuth.token, SECRET_KEY, (error, payload) => {
      if (error) {
        req.faAuth.error = error;
      } else {
        delete req.faAuth.error;
        req.faAuth.payload = payload;
        req.faAuth.userId = payload.id;
        req.faAuth.type = 'jwt';
      }
      next();
    });
  },

  /**
   * Restify middleware to verify that the token in req.faAuth.token is a
   * valid personal access token and update the req.faAuth object with the
   * database record for that token and the id of the user the token belongs to.
   * @param  {Object}   req  Request object
   * @param  {Object}   res  Response object
   * @param  {Function} next callback to forward to the next middleware
   * @return {void}
   */
  verifyPersonalAccessToken(req, res, next) {
    if (req.faAuth.userId || req.faAuth.clientId) {
      return next();
    }
    return new Token({ token: req.faAuth.token })
      .fetch()
      .then((token) => {
        if (token) {
          delete req.faAuth.error;
          req.faAuth.tokenModel = token;
          req.faAuth.userId = token.get('user_id');
          req.faAuth.type = 'personal_access_token';
          next();
        } else {
          throw new Error("Personal access token doesn't exist");
        }
      })
      .catch((error) => {
        req.faAuth.error = error;
        next();
      });
  },

  verifyClientApp(req, res, next) {
    if (req.faAuth.userId || req.faAuth.clientId || !req.body) {
      return next();
    }

    const { meta: { source = {} } = {} } = req.body;
    if (!source.client_id) {
      logger.warn(`App client ID for %s not provided`, req.faAuth.type);
      req.faAuth.error = new Error('Invalid client ID');
      return next();
    }

    return new App({ access_key: req.faAuth.token, id: source.client_id })
      .fetch()
      .then((model) => {
        if (model) {
          delete req.faAuth.error;
          req.faAuth.clientAppModel = model;
          req.faAuth.clientId = model.get('company_id');
          req.faAuth.type = 'app';
          next();
        } else {
          throw new Error('Invalid app access key');
        }
      })
      .catch((error) => {
        req.faAuth.error = error;
        return next();
      });
  },

  /**
   * Restify middleware authenticate the user in req.faAuth.userId and update
   * the req.user object with details of the authenticated user
   * @param  {Object}   req  Request object
   * @param  {Object}   res  Response object
   * @param  {Function} next callback to forward to the next middleware
   * @return {void}
   */
  authenticate(req, res, next) {
    const authenticationFailure = () => {
      next(new AuthenticationError('Invalid token.'));
    };

    if (req.faAuth.error) {
      logger.error('Could not verify token', req.faAuth.error);
      return authenticationFailure();
    }

    if (req.faAuth.userId) {
      return new User({ id: req.faAuth.userId })
        .fetch({ withRelated: ['company'] })
        .then((user) => {
          if (!user) {
            logger.warn(
              `Attempt to use a %s token belonging to non-existent user %s`,
              req.faAuth.type,
              req.faAuth.userId,
            );
            return authenticationFailure();
          }

          if (
            req.faAuth.type === 'jwt' &&
            user.get('email') !== req.faAuth.payload.email
          ) {
            logger.warn(
              `Attempt to use JWT token issued to user %s who have sinced changed their email`,
              req.faAuth.userId,
            );
            return authenticationFailure();
          }

          const isACompanyUser = user.has('company_id');
          const hasParentCompany = user.related('company').has('id');
          if (isACompanyUser && !hasParentCompany) {
            logger.warn(
              `Attempt use a %s token issued to user %s belonging to deleted company %s`,
              req.faAuth.type,
              req.faAuth.userId,
              user.get('company_id'),
            );
            return authenticationFailure();
          }

          if (!user.get('active')) {
            logger.warn(
              `Attempt use a %s token issued to inactive user %s`,
              req.faAuth.type,
              req.faAuth.userId,
            );
            return authenticationFailure();
          }

          req.user = user.serialize();
          return next();
        });
    } else if (req.faAuth.clientId) {
      const { meta: { user: owner = {} } = {} } = req.body;
      if (!owner.email) {
        logger.warn(`User email for %s not provided`, req.faAuth.type);
        return authenticationFailure();
      }
      return new User({ email: owner.email })
        .fetch({ withRelated: ['company'] })
        .then((user) => {
          if (!user) {
            logger.warn(
              `Attempt to use a %s token belonging to non-existent user %s`,
              req.faAuth.type,
              req.faAuth.userId,
            );
            return authenticationFailure();
          }

          if (!user.get('active')) {
            logger.warn(
              `Attempt use a %s token issued to inactive user %s`,
              req.faAuth.type,
              req.faAuth.userId,
            );
            return authenticationFailure();
          }

          if (
            req.faAuth.clientAppModel.get('company_id') !==
            user.get('company_id')
          ) {
            logger.warn(
              `Attempt use a %s token for company %s issued to user in company %s`,
              req.faAuth.type,
              req.faAuth.clientAppModel.get('company_id'),
              user.get('company_id'),
            );
            return authenticationFailure();
          }

          req.user = user.serialize();
          req.clientApp = req.faAuth.clientAppModel.serialize();
          return next();
        });
    }

    logger.warn(`Unkown %s token type`, req.faAuth.type);
    return authenticationFailure();
  },

  auditPersonalAccessToken(req, res, next) {
    if (req.faAuth.type !== 'personal_access_token') {
      return next();
    }
    return req.faAuth.tokenModel
      .related('usages')
      .create({
        last_6_token_chars: req.faAuth.tokenModel.get('token').slice(-6),
        ip: req.sourceIp,
        user_agent: req.userAgent(),
        request: {
          version: req.version(),
          method: req.method,
          path: req.href(),
        },
        time: req.date(),
      })
      .then(() => next());
  },

  /**
   * @param  {Object} req request object(token, body, params)
   * @param  {Object} res response object
   * @param  {Function} next next method
   */
  getPermissions(req, res, next) {
    PermissionService.get(req.user.id)
      .then((result) => {
        const permissions = _.map(result, (permission) => {
          return { permission: permission.permission, scope: permission.scope };
        });

        req.user.permissions = permissions;
        next();
        return null;
      })
      .catch((error) => {
        next(new AuthenticationError(`Could not fetch permissions ${error}`));
      });
  },
};

module.exports = {
  invalidPermissions,
  /**
   * @param  {Object} user Logged in User object
   * @param  {Object} permission permission object(permission and scope)
   */
  hasPermission(user, permission) {
    const isPermitted = _.find(user.permissions, permission);
    return isPermitted;
  },

  parseToken: auth.ifNeeded(auth.parseToken),
  verifyJwt: auth.ifNeeded(auth.verifyJwt),
  verifyPersonalAccessToken: auth.ifNeeded(auth.verifyPersonalAccessToken),
  verifyClientApp: auth.ifNeeded(auth.verifyClientApp),
  authenticate: auth.ifNeeded(auth.authenticate),
  auditPersonalAccessToken: auth.ifNeeded(auth.auditPersonalAccessToken),
  getPermissions: auth.ifNeeded(auth.getPermissions),
};
