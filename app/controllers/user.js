const httpStatus = require('http-status');
const errors = require('../errors');
const userService = require('../services/user');
const permissionService = require('../services/permission');

class UserController {
  /**
   * Add data to the controller
   *
   * @param {object} req Restify request object
   * @param {object} res Restify response object
   * @param {function} next Restify routing callback
   * @return {callback}
   */
  create(req, res, next) {
    userService
      .create(req)
      .then((data) => res.send(httpStatus.CREATED, data))
      .catch((error) => {
        if (error instanceof errors.UserAlreadyCreated) {
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

  /**
   * Get a user by ID
   *
   * @param  {Object} req   Restify request object
   * @param  {Object} res   Reetify response object
   */
  get(req, res, next) {
    userService
      .getUser(req)
      .then((user) => {
        if (user) {
          user.set('active', user.get('active') === 1);
          user.set('superadmin', user.get('superadmin') === 1);
          res.send(httpStatus.OKAY, user);
        } else {
          res.send(httpStatus.NOT_FOUND, { message: 'user not found' });
        }
      })
      .then(() => next());
  }

  /**
   * Get a user permissions by ID
   *
   * @param  {Object} req   Restify request object
   * @param  {Object} res   Reetify response object
   */
  getPermissions(req, res, next) {
    userService
      .getUser(req)
      .then((user) => {
        if (user && Number(user.get('active')) === 1) {
          return permissionService
            .get(req.params.id)
            .then((permissions) => res.send(httpStatus.OK, permissions))
            .catch(() => {
              res.send(httpStatus.BAD_REQUEST, {
                message: 'Error fetching permissions',
              });
            });
        }
        return res.send(httpStatus.BAD_REQUEST, { message: 'Invalid user' });
      })
      .then(() => next());
  }

  /**
   * Update a user
   *
   * @param {object} req Restify request object
   * @param {object} res Restify response object
   * @param {function} next Restify routing callback
   * @return {callback}
   */
  update(req, res, next) {
    userService
      .update(req)
      .then((user) => res.send(httpStatus.OKAY, user))
      .catch((error) => {
        if (error instanceof errors.UserNotFound) {
          res.send(httpStatus.NOT_FOUND, error);
        } else if (error instanceof errors.PasswordAlreadyUsed) {
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

  /**
   * Authenticate a user with email and password
   *
   * @param  {Object} req   Restify request object
   * @param  {Object} res   Reetify response object
   */
  login(req, res, next) {
    userService
      .login(req.body)
      .then((result) => res.send(result))
      .catch((error) => {
        if (
          error instanceof errors.DeactivatedUser ||
          error instanceof errors.UserNotFound
        ) {
          res.send(httpStatus.FORBIDDEN, error);
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
   * Get all users belonging to a company
   *
   * @param {Object} req Restify request object contains company id
   * @param {Object} res Restify response object
   */
  listByCompany(req, res, next) {
    userService
      .listByCompany(req.params.id)
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

  listApplicationUsers(req, res, next) {
    userService
      .listApplicationUsers()
      .then((users) => res.send(httpStatus.OK, users))
      .catch(() => {
        res.send(
          httpStatus.INTERNAL_SERVER_ERROR,
          new errors.InternalServerError('Internal Server Error'),
        );
      })
      .then(() => next());
  }

  /**
   * Uploads user profile image
   *
   * @param {Object} req, Restify request object
   * @param {Object} res, Restify response object
   */
  updateProfileImage(req, res, next) {
    userService
      .updateProfileImage(req)
      .then((message) => res.send(httpStatus.OK, message))
      .catch((error) => {
        if (error instanceof errors.UserNotFound) {
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
module.exports = new UserController();
