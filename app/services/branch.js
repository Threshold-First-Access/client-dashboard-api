const shortid = require('shortid');
const Branch = require('../models/branch');
const Company = require('../models/company');
const errors = require('../errors');
const bookshelf = require('../bookshelf');
const _ = require('lodash');
const logger = require('../logger');

class BranchService {
  /**
   * Get company branches by company ID
   *
   * @param companyId Integer company ID
   */
  listByCompany(companyId) {
    const reqId = shortid.generate();
    return new Branch()
      .where({ company_id: companyId })
      .fetchAll()
      .then((branches) => {
        logger.info(
          `Request ID: ${reqId} - Branches for company with ID ${companyId} gotten`,
        );
        return branches;
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error getting branches for company with id ${companyId}: ${error}`,
        );
        throw error;
      });
  }

  /**
   * Create a company branch.
   *
   * @param  {req} req Restify request object
   */
  create(req) {
    const reqId = shortid.generate();
    const companyId = req.params.company_id;
    const branchName = req.body.name;

    logger.info(`Request ID: ${reqId} - Create branch ${branchName}`);
    return bookshelf.transaction((trx) => {
      trx.user_id = req.user.id;
      return new Company({ id: companyId }).fetch().then((company) => {
        if (company) {
          return new Branch()
            .save(
              { company_id: company.toJSON().id, name: branchName },
              { transacting: trx },
            )
            .then((branch) => {
              logger.info(
                `Request ID: ${reqId} - Created branch ${branch.toJSON().name}`,
              );
              return branch.toJSON();
            })
            .catch((error) => {
              logger.error(
                `Request ID: ${reqId} - There was an error creating a branch: - ${error}`,
              );
              throw error;
            });
        }
        throw new errors.CompanyNotFound('Company does not exist');
      });
    });
  }

  /*
   * Update a company branch
   *
   * @param {Object} req Restify request object
   */
  update(req) {
    const reqId = shortid.generate();
    const branchId = req.params.branch_id;

    const update = _.pick(req.body, ['name', 'active']);
    return new Branch({ id: branchId })
      .save(update, { patch: true, user_id: req.user.id })
      .then((branch) => {
        logger.info(
          `Request ID: ${reqId} - Branch ${branchId} for company ${branch.get(
            'company_id',
          )} updated`,
        );
        return branch.refresh();
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error updating branch ${branchId}: ${error}`,
        );
        throw error;
      });
  }

  /**
   * Soft deletes a branch
   *
   * @param {Object} req Restify request object
   */
  remove(req) {
    const reqId = shortid.generate();

    const branchId = req.params.branch_id;

    return bookshelf.transaction((trx) => {
      trx.user_id = req.user.id;
      return new Branch({ id: branchId }).fetch().then((branch) => {
        if (!branch) {
          throw new errors.BranchNotFound('Branch does not exist');
        }
        logger.info(
          `Request ID: ${reqId} - Got branch with id ${branchId} belonging to company with id ${branch.get(
            'company_id',
          )}`,
        );
        return bookshelf
          .knex('users')
          .where('branch_id', branch.id)
          .then((users) => {
            const activeUsers = users.filter((user) => user.active === 1);

            logger.info(
              `Request ID: ${reqId} - Got active users for branch with id ${branchId}`,
            );
            if (!activeUsers.length) {
              logger.info(
                `Request ID: ${reqId} - Deleting branch with id ${branchId}`,
              );
              return branch.destroy({ transacting: trx });
            }

            logger.error(
              `Request ID: ${reqId} - Could not delete branch with id ${branchId}, it has ${
                activeUsers.length
              } active users`,
            );
            throw new errors.BranchHasActiveUsers('Branch has active users');
          });
      });
    });
  }
}

module.exports = new BranchService();
