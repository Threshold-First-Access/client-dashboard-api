const _ = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs');
const shortid = require('shortid');
const Role = require('../models/role');
const Permission = require('../models/permission');
const RoleUser = require('../models/role_user');
const errors = require('../errors');
const logger = require('../logger');
const cache = require('../services/cache');

class RoleService {
  /**
   * Create a new Role.
   *
   * @param  {object} data
   * @returns {Promise.<T>}
   */
  create(req) {
    const reqId = shortid.generate();

    const allowedKeys = ['id', 'name', 'description', 'type', 'company_id'];

    logger.info(`Create a new role with data ${JSON.stringify(req.body)}`);
    const roleData = _.pick(req.body, allowedKeys);
    const companyId = req.body.company_id || null;
    return new Role({
      name: req.body.name,
      company_id: companyId,
    })
      .fetch()
      .then((roles) => {
        if (roles) {
          logger.error(
            `Request ID: ${reqId} - Role already exists with that name: ${
              req.body.name
            }`,
          );
          throw new errors.RoleAlreadyCreated(
            `Role already exists with that name: ${req.body.name}`,
          );
        }

        return new Role()
          .save(roleData, { user_id: req.user.id })
          .then((role) => {
            logger.info(
              `Request ID: ${reqId} - Role with data ${JSON.stringify(
                req.body,
              )} created`,
            );
            return role;
          })
          .catch((error) => {
            if (error.code === 'ER_DUP_ENTRY') {
              logger.error(
                `equest ID: ${reqId} - Role with data ${JSON.stringify(
                  roleData,
                )} was already created`,
              );
              throw new errors.RoleAlreadyCreated(
                'Role with that name already exists.',
              );
            }
            logger.error(
              `Request ID: ${reqId} - Error creating a new role ${error}`,
            );
            throw error;
          });
      })
      .catch((error) => {
        logger.error(`Request ID: ${reqId} - Error creating role: ${error}`);
        throw error;
      });
  }

  /**
   * Get a list of all Roles
   */
  list() {
    return new Role()
      .fetchAll()
      .then((roles) => roles)
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Get a list of all Roles in a company
   * @param  {Integer} companyId Id of company to get roles for
   */
  listByCompany(companyId) {
    return new Role().where({ company_id: companyId }).fetchAll();
  }

  /**
   * Get a list of all Roles at the application level
   */
  listApplicationRoles() {
    return this.listByCompany(null);
  }

  /**
   * Fetch a role model by id
   *
   * @param {String} id
   */

  fetch(id) {
    return new Role({ id })
      .fetch({
        withRelated: ['permissions', 'users'],
      })
      .then((role) => {
        if (role) {
          return role;
        }
        throw new errors.RoleNotFound('Role not found');
      });
  }

  /**
   * Get a Role by id with available permissions and users included
   *
   * @param {String} id
   */
  get(req) {
    return req.role.load(['permissions', 'users']).then((role) => {
      return this.getPermissions().then((permissions) => {
        const availablePermissions = permissions
          .filter((permission) => {
            // If company_id is set, it is a company level role.
            // Otherwise, it is an application level role
            return role.has('company_id')
              ? permission.scope === 'company' || permission.scope === 'branch'
              : permission.scope === 'application';
          })
          .map((permission) => {
            permission.assigned = role
              .related('permissions')
              .some((assignedPermission) => {
                return (
                  permission.permission === assignedPermission.get('permission')
                );
              });
            return permission;
          });

        const serializedRole = role.serialize({ omitPivot: true });
        serializedRole.available_permissions = availablePermissions;
        delete serializedRole.permissions;

        return serializedRole;
      });
    });
  }

  /**
   * Get User permissions by user type.
   *
   * @param  {String} userType
   */
  getPermissions() {
    return new Promise((resolve, reject) => {
      fs.readFile('assets/permissions.yml', (err, data) => {
        if (err) reject(err);

        const permissions = yaml.safeLoad(data).permissions;
        resolve(permissions);
      });
    });
  }

  /**
   * Get permissions available to a role
   *
   * @param  {Number} roleId [description]
   */

  getAvailablePermissions(req) {
    return this.get(req).then((role) => role.available_permissions);
  }

  /**
   * Check if is valid permission
   *
   * @param {Object} permission  - permission object
   */
  comparePermission(permission) {
    return (otherPermission) =>
      permission.permission === otherPermission.permission &&
      permission.scope === otherPermission.scope;
  }

  /**
   * Add/Remove permission for a Role
   *
   * @param  {Object} req
   */
  addPermissions(req) {
    const reqId = shortid.generate();
    const roleId = Number(req.params.id);
    const newPermission = _.pick(req.body, [
      'name',
      'permission',
      'scope',
      'category',
    ]);

    return req.role
      .load(['permissions', 'users'])
      .then((role) => {
        if (role) {
          if (req.body.assigned) {
            return this.getPermissions().then((permissions) => {
              // Add permission to role
              if (permissions.find(this.comparePermission(newPermission))) {
                return this.permissionExists(roleId, newPermission)
                  .then((exists) => {
                    if (!exists) {
                      newPermission.role_id = roleId;
                      return new Permission()
                        .save(newPermission, { user_id: req.user.id })
                        .then(() => {
                          logger.info(
                            `Request ID: ${reqId} - Permission ${JSON.stringify(
                              newPermission,
                            )} added to role with ID ${roleId}`,
                          );
                          return new Role({ id: roleId })
                            .fetch({ withRelated: ['permissions', 'users'] })
                            .then((updatedRole) => {
                              const users = updatedRole
                                .related('users')
                                .toJSON();
                              _.forEach(users, (user) => {
                                cache.clear(`user_permissions_${user.id}`);
                              });
                              return updatedRole;
                            });
                        });
                    }

                    logger.error(
                      `Request ID: ${reqId} - Permission ${JSON.stringify(
                        newPermission,
                      )} already exists in role with ID ${roleId}`,
                    );
                    throw errors.PermissionNotFound(
                      'Permission already exists for this role',
                    );
                  })
                  .catch((error) => {
                    logger.error(
                      `Request ID: ${reqId} - Error updating ${JSON.stringify(
                        newPermission,
                      )} for role with ID ${roleId}`,
                    );
                    throw error;
                  });
              }

              logger.error(
                `Request ID: ${reqId} - Invalid permission ${JSON.stringify(
                  newPermission,
                )} for role with ID ${roleId}`,
              );
              throw errors.PermissionNotFound(
                'Invalid. Permission does not exist.',
              );
            });
          }

          // Remove permission from role
          return this.permissionExists(roleId, newPermission)
            .then((permission) => {
              if (permission) {
                return permission
                  .destroy({ user_id: req.user.id })
                  .then(() => {
                    logger.info(
                      `Request ID: ${reqId} - Permission ${JSON.stringify(
                        newPermission,
                      )} removed from role with ID ${roleId}`,
                    );
                    return new Role({ id: roleId }).fetch({
                      withRelated: ['permissions', 'users'],
                    });
                  })
                  .then((updatedRole) => {
                    updatedRole.related('users').forEach((user) => {
                      cache.clear(`user_permissions_${user.get('id')}`);
                    });
                    return updatedRole;
                  });
              }
              logger.error(
                `Request ID: ${reqId} - Permission ${JSON.stringify(
                  newPermission,
                )} does not exists in role with ID ${roleId}`,
              );
              throw errors.PermissionNotFound(
                'Permission not found for this role',
              );
            })
            .catch((error) => {
              logger.error(
                `Request ID: ${reqId} - Error updating ${JSON.stringify(
                  newPermission,
                )} for role with ID ${roleId}`,
              );
              throw error;
            });
        }

        logger.error(`Request ID: ${reqId} - Role with ID ${roleId} not found`);
        throw new errors.RoleNotFound('Role not found.');
      })
      .catch((error) => {
        logger.error(`Request ID: ${reqId} - Error adding roles: ${error}`);
        throw error;
      });
  }

  /**
   * Add a user to a Role.
   *
   * @param  {Object} req - Restify request object
   */
  addUser(req) {
    const reqId = shortid.generate();
    const roleId = req.params.id;
    const userId = req.params.user_id;

    return this.fetch(roleId)
      .then((role) => {
        if (role) {
          if (req.body.assign) {
            // Add a user to a role
            return this.userExistsInRole(roleId, userId)
              .then((roleUser) => {
                if (!roleUser) {
                  cache.clear(`user_permissions_${userId}`);
                  return new RoleUser().save(
                    {
                      role_id: roleId,
                      user_id: userId,
                    },
                    { user_id: req.user.id },
                  );
                }

                logger.error(
                  `Request ID: ${reqId} - User with ID ${userId} already exists in role with ID ${roleId}`,
                );
                throw errors.UserAlreadyExists(
                  'User already exists for this role',
                );
              })
              .catch((error) => {
                logger.error(
                  `Request ID: ${reqId} - Error updating user with ID ${userId} for role with ID ${roleId}`,
                );
                throw error;
              });
          }

          // Remove a user from a role
          return this.userExistsInRole(roleId, userId)
            .then((roleUser) => {
              if (roleUser) {
                cache.clear(`user_permissions_${userId}`);
                return new RoleUser()
                  .where({
                    role_id: roleUser.get('role_id'),
                    user_id: roleUser.get('user_id'),
                  })
                  .destroy({ user_id: req.user.id });
              }

              logger.error(
                `Request ID: ${reqId} - User with ID ${userId} does not exist in role with ID ${roleId}`,
              );
              throw errors.UserAlreadyExists(
                'User does not exist in this role',
              );
            })
            .catch((error) => {
              logger.error(
                `Request ID: ${reqId} - Error updating user with ID ${userId} for role with ID ${roleId}`,
              );
              throw error;
            });
        }

        logger.error(`Request ID: ${reqId} - Role with ID ${roleId} not found`);
        throw new errors.RoleNotFound('Role not found');
      })
      .catch((error) => {
        logger.error(`Request ID: ${reqId} - Error updating role: ${error}`);
        throw error;
      });
  }

  /**
   * Return Model if permission exists in role, null if not
   *
   * @param  {Integer} roleId
   * @param  {Object} permission
   */
  permissionExists(roleId, permission) {
    return new Permission({
      role_id: roleId,
      permission: permission.permission,
      scope: permission.scope,
    }).fetch();
  }

  /**
   * Return model if user exists in role, null if not.
   *
   * @param {Integer} roleId
   * @param {Integer} userId
   */
  userExistsInRole(roleId, userId) {
    return new RoleUser({
      role_id: roleId,
      user_id: userId,
    }).fetch();
  }

  /**
   * Deletes a role
   *
   * @param {Number} roleId id of role to delete
   * @param {Number} userId id of user perfoming the action
   * @return {Promise}
   * */
  delete(req) {
    const reqId = shortid.generate();
    const roleId = req.params.id;
    logger.info(`Request ID: ${reqId} Deleting role with ID ${roleId}`);
    return req.role.destroy({ user_id: req.user.id });
  }
}

module.exports = new RoleService();
