const httpStatus = require('http-status');
const errors = require('../../app/errors');
const roleService = require('../services/role');

class RoleController {
  /**
   * Create a new role.
   *
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  create(req, res, next) {
    roleService
      .create(req)
      .then((data) => res.send(httpStatus.CREATED, data))
      .catch((error) => {
        if (error instanceof errors.RoleAlreadyCreated) {
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
   * Delete a role.
   *
   * @param  {Object} req
   * @param  {Object} res
   */
  delete(req, res, next) {
    roleService
      .delete(req)
      .then((data) => res.send(httpStatus.OK, data))
      .catch((error) => {
        if (error instanceof errors.RoleNotFound) {
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

  /**
   * List all roles.
   *
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  list(req, res, next) {
    roleService
      .list()
      .then((groups) => res.send(httpStatus.OK, groups))
      .catch(() => {
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Get a role by ID.
   *
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  get(req, res, next) {
    roleService
      .get(req)
      .then((group) => res.send(httpStatus.OK, group))
      .catch((error) => {
        if (error instanceof errors.RoleNotFound) {
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

  /**
   * Get permissions by user type
   *
   * @param  {Onject} req
   * @param  {Object} res
   * @param  {Function} next
   */
  permissions(req, res, next) {
    roleService
      .getPermissions()
      .then((permissions) => res.send(httpStatus.OK, permissions))
      .catch((err) =>
        res.send(httpStatus.FORBIDDEN, new errors.InvalidType(err.message)),
      )
      .then(() => next());
  }

  /**
   * Get permissions available to a role
   *
   * @param  {Onject} req
   * @param  {Object} res
   * @param  {Function} next
   */
  listAvailablePermissions(req, res, next) {
    roleService
      .getAvailablePermissions(req)
      .then((permissions) => res.send(httpStatus.OK, permissions))
      .catch((error) => {
        if (error instanceof errors.RoleNotFound) {
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

  /**
   * Add permissions for a role.
   *
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  addPermissions(req, res, next) {
    roleService
      .addPermissions(req)
      .then((Role) => res.send(httpStatus.CREATED, Role))
      .catch((error) => {
        if (
          error instanceof errors.RoleNotFound ||
          error instanceof errors.PermissionNotFound
        ) {
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

  /**
   * Add a user to a role.
   *
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  addUser(req, res, next) {
    roleService
      .addUser(req)
      .then(() =>
        res.send(httpStatus.CREATED, {
          message: 'User role has been succesfully updated',
        }),
      )
      .catch((error) => {
        if (
          error instanceof errors.RoleNotFound ||
          error instanceof errors.UserNotFound
        ) {
          res.send(httpStatus.NOT_FOUND, error);
        } else if (error instanceof errors.UserAlreadyExists) {
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
   * List all roles in a company.
   *
   * @param  {Object} req
   * @param  {Object} res
   */
  listByCompany(req, res, next) {
    roleService
      .listByCompany(req.params.company_id)
      .then((roles) => res.send(httpStatus.OK, roles))
      .catch(() => {
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * List all application level roles.
   *
   * @param  {Object} req
   * @param  {Object} res
   */
  listApplicationRoles(req, res, next) {
    roleService
      .listApplicationRoles()
      .then((roles) => res.send(httpStatus.OK, roles))
      .catch(() => {
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }
}

module.exports = new RoleController();
