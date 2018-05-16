const httpStatus = require('http-status');
const createCustomError = require('custom-error-generator');
const logger = require('../logger');

// The lower the value higher the precedence. Scopes with higher
// precedence encompasses scopes with lower precedence. e.g if a role has
// a permission in the company scope, that permission covers all branches.
// So, if no scope is specified, we want to use the company scoped one.
const scopePrecedence = { application: 0, company: 1, branch: 2 };
// prettier-ignore
const getScopePrecedence = scope => (
  // give unknown scopes relatively low precedence
  typeof scopePrecedence[scope] !== 'undefined' ? scopePrecedence[scope] : 1000
);

function compareContexts(a, b) {
  if (a !== null && a !== undefined && b !== null && b !== undefined) {
    return a.toString() === b.toString();
  }
  return a === b;
}

function checkOnePermission(user, requestContext, permission) {
  if (!permission.permission) {
    // we cannot deny access if there's no permission to check for
    return { success: true };
  }
  const matchingPermission = user.permissions
    .sort((a, b) => getScopePrecedence(a.scope) - getScopePrecedence(b.scope))
    .find(
      (p) =>
        p.permission === permission.permission &&
        // scope is optional so, we only use it's when provided
        (!permission.scope || p.scope === permission.scope),
    );
  if (!matchingPermission) {
    return {
      success: false,
      reason: 'missing permission',
      permission,
    };
  }
  const result = { permission: matchingPermission };
  if (matchingPermission.scope === 'application') {
    result.success = true;
  } else if (matchingPermission.scope === 'company') {
    result.success = compareContexts(user.company_id, requestContext.companyId);
  } else if (matchingPermission.scope === 'branch') {
    result.success = compareContexts(user.branch_id, requestContext.branchId);
  } else {
    throw Error(
      `Matching permission '${
        matchingPermission.permission
      }' doesn't have scope`,
    );
  }
  if (!result.success) {
    result.reason = 'context mismatch';
  }
  return result;
}

function createPermissionChecker(user, requestContext) {
  return (permission) => checkPermissions(user, requestContext, permission);
}

function checkAnyPermission(user, requestContext, permissions) {
  if (!permissions.length) {
    // we cannot deny access if there are no permissions to check for
    return { success: true };
  }
  const results = permissions.map(
    createPermissionChecker(user, requestContext),
  );
  if (results.some((result) => result.success)) {
    return { success: true, results };
  }
  return {
    success: false,
    reason: 'insufficent anyOf',
    results,
  };
}

function checkAllPermissions(user, requestContext, permissions) {
  if (!permissions.length) {
    // we cannot deny access if there are no permissions to check for
    return { success: true };
  }
  const results = permissions.map(
    createPermissionChecker(user, requestContext),
  );
  if (results.every((result) => result.success)) {
    return { success: true, results };
  }
  return {
    success: false,
    reason: 'insufficent allOf',
    results,
  };
}

function checkPermissions(user, requestContext = {}, permissions = {}) {
  if (Array.isArray(permissions.anyOf) && Array.isArray(permissions.allOf)) {
    throw Error(
      "Cannot specify both 'anyOf' or 'allOf' in the same permissions object",
    );
  }
  if (Array.isArray(permissions.anyOf)) {
    return checkAnyPermission(user, requestContext, permissions.anyOf);
  }
  if (Array.isArray(permissions.allOf)) {
    return checkAllPermissions(user, requestContext, permissions.allOf);
  }
  return checkOnePermission(user, requestContext, permissions);
}

class PermissionsError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = httpStatus.FORBIDDEN;
  }
}

class InternalServerError extends Error {
  constructor(message = 'Internal Server Error') {
    super(message);
    this.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  }
}

/**
 * Restify middleware for authorization
 *
 * This middleware relies on an authorization object specified in the route definition.
 * If no authorization object is specified, the middleware does nothing
 *
 * The authorization object specifies:
 * 1) The permissions that a user must have to be allowed access
 *
 * The permissions can be specified as a permissions object or a getPermissions function
 * which returns the permissions object immediately or via a promise.
 *
 * A permission in the permissions object must have the key permission and optionally scope.
 * When scope is specified, only permissions with the same scope property are considered matching.
 * When not specified, any permission with the same permission property applies but only the
 * one with the higest scope is used
 *
 * The permissions object can have one permission or multiple permissions combined
 * using anyOf or allOf keys with the values being arrays of permissions.
 *
 * 2) The context of that particular request i.e. in which company/branch the action
 * will be performed
 *
 * The request context can be specified as a requestContext object or a getRequestContext
 * function which returns the requestContext object immediately or via a promise
 * The requestContext object may have companyId and branchId
 *
 * The request context is used to determine whether the scope of permission that the
 * user has suffices for this request i.e if a user has a permission in company scope
 * and the context specifies a companyId different from the user's company's id, then
 * the user cannot be allowed access.
 *
 * Example 1:
 * server.get({
 *   path: '/companies/:company_id/users',
 *   name: 'get_company_users',
 *   validation: { ... },
 *   authorization: {
 *     permissions: {
 *       anyOf: [{
 *         permission: 'CAN_VIEW_COMPANY_USERS',
 *         scope: 'company'
 *       }, {
 *         permission: 'CAN_UPDATE_USER'
 *       }]
 *     },
 *     getRequestContext: req => ({
 *       companyId: req.params.company_id
 *     })
 *   }
 * }, (req, res) => user.listByCompany(req, res));
 *
 * Example 2:
 * server.get({
 *   path: '/users/:user_id',
 *   name: 'update_user',
 *   validation: { ... },
 *   authorization: {
 *     getPermissions(req) {
 *       if(req.params.user_id === req.user.id) {
 *        // users can update themselves
 *        return null;
 *       }
 *       return { permission: 'CAN_UPDATE_USER' }
 *     },
 *     getRequestContext(req) {
 *       return new User({ id: req.params.user_id })
 *       .fetch()
 *       .then(user => ({
 *         companyId: user.get('company_id'),
 *         branchId: user.get('branch_id')
 *       }))
 *     }
 *   }
 * }, (req, res) => user.listByCompany(req, res));
 *
 */

function permissionsMiddleware(req, res, next) {
  const { authorization } = req.route;
  if (!authorization || typeof authorization !== 'object') {
    logger.debug('No authorization specified');
    return next();
  }
  return Promise.all([
    Promise.resolve().then(() => {
      if (typeof authorization.getPermissions === 'function') {
        return authorization.getPermissions(req);
      }
      return authorization.permissions;
    }),
    Promise.resolve().then(() => {
      if (typeof authorization.getRequestContext === 'function') {
        return authorization.getRequestContext(req);
      }
      return authorization.requestContext;
    }),
  ])
    .then(([permissions, requestContext]) => {
      logger.debug('Request Context:', JSON.stringify(requestContext, null, 2));
      if (req.user.superadmin) {
        logger.info(
          `Super Admin ${req.user.email} automatically granted access`,
        );
        return next();
      }
      if (
        compareContexts(requestContext && requestContext.userId, req.user.id)
      ) {
        logger.info(
          `User ${
            req.user.email
          } automatically granted access on something they own`,
        );
        return next();
      }
      const result = checkPermissions(req.user, requestContext, permissions);
      logger.debug(
        'Permissions Check Result:',
        JSON.stringify(result, null, 2),
      );
      if (result.success) {
        return next();
      }
      return next(
        new PermissionsError('Forbidden due to insufficient permissions'),
      );
    })
    .catch((error) => {
      logger.error(`Error checking permissions: ${error}`);
      if (error instanceof permissionsMiddleware.ContextNotFound) {
        next(error);
      } else {
        next(new InternalServerError());
      }
    });
}

permissionsMiddleware.ContextNotFound = createCustomError(
  'ContextNotFound',
  null,
  function constructor(message, options = {}) {
    this.statusCode = options.status || httpStatus.NOT_FOUND;
  },
);

module.exports = permissionsMiddleware;
