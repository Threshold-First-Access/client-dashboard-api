const shortid = require('shortid');
const _ = require('lodash');
const country = require('countryjs');
const Company = require('../../app/models/company');
const errors = require('../errors');
const bookshelf = require('../bookshelf');
const uploadUtil = require('../../library/upload');
const logger = require('../logger');

class CompanyService {
  /**
   * Get the meta information associated with a country
   * using the country country code
   * @param {Object} countryCode Holds meta data of a country(timezone, currency, language, name)
   * @returns {Object} Holds meta data of a country(timezone, currency, language, name)
   */
  getCountryMetaData(companyData, countryCode) {
    companyData.timezone = country.timezones(countryCode).toString();
    companyData.currency = country.currencies(countryCode).toString();
    companyData.language = country.languages(countryCode).toString();
    companyData.country_name = country.name(countryCode).toString();

    return companyData;
  }

  /**
   * Get a company by ID
   *
   * @param  {Interger} companyId
   */
  get(id) {
    const reqId = shortid.generate();

    return new Company({ id })
      .fetch()
      .then((company) => {
        if (company) {
          logger.info(`Request ID: ${reqId} - Company with ID: ${id} found`);
          return company;
        }

        logger.error(`Request ID: ${reqId} - Company with ID: ${id} not found`);
        throw new errors.CompanyNotFound('Company not found');
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error occured fetching company with ID: ${id}: ${error}`,
        );
        throw error;
      });
  }

  /**
   * Create a new company
   * @param {Object} req Contains company's `name` and `country`
   */
  create(req) {
    const allowedKeys = ['name', 'slug', 'country', 'test_mode_enabled'];
    const companyData = _.pick(req.body, allowedKeys);
    const reqId = shortid.generate();

    logger.info(
      `Request ID: ${reqId} - Has this company ${JSON.stringify(
        companyData,
      )} been registered?`,
    );
    return bookshelf.transaction((trx) => {
      trx.user_id = req.user.id;
      const updatedCompanyData = this.getCountryMetaData(
        companyData,
        companyData.country,
      );
      return new Company()
        .save(updatedCompanyData, { transacting: trx })
        .then((company) => {
          logger.info(
            `Request ID: ${reqId} - This company ${JSON.stringify(
              companyData,
            )} is now registered`,
          );
          return company;
        })
        .catch((error) => {
          logger.error(
            `Request ID: ${reqId} - There was an error ${error} registering company ${JSON.stringify(
              companyData,
            )}`,
          );
          if (error.code === 'ER_DUP_ENTRY') {
            const regex = /Duplicate entry '(.)+' for key 'companies_(.+)_unique'/i;
            const result = regex.exec(error.message);
            let value = result[1];
            let column = result[2];
            if (column.indexOf('slug') !== -1) {
              column = 'Slug';
              value = companyData.slug;
            }
            if (column.indexOf('name') !== -1) {
              column = 'Name';
              value = companyData.name;
            }
            throw new errors.CompanyAlreadyCreated(
              `${column} '${value}' is already registered`,
            );
          }
          throw error;
        });
    });
  }

  getBySlug(req) {
    const reqId = shortid.generate();
    logger.info(
      `Request ID: ${reqId} - Company with Slug: ${req.company.get(
        'slug',
      )} found`,
    );
    return Promise.resolve(req.company);
  }

  /**
   * Update an existing company
   * @param {Object} req Object of the company information, name, country, timezone,
   *                    currency and company ID
   */
  update(req) {
    const companyId = req.params.id;
    const allowedKeys = [
      'name',
      'slug',
      'country',
      'country_name',
      'timezone',
      'currency',
      'language',
      'test_mode_enabled',
    ];
    let companyData = _.pick(req.body, allowedKeys);
    const reqId = shortid.generate();
    const name = companyData.name;
    const code = companyData.country;
    if (code) {
      companyData = this.getCountryMetaData(companyData, code);
    }
    logger.info(
      `Request ID: ${reqId} - Company: ${companyId} about to be updated ${JSON.stringify(
        companyData,
      )}`,
    );
    return new Company({ id: companyId })
      .save(companyData, { patch: true, user_id: req.user.id })
      .then((company) => {
        logger.info(
          `Request ID: ${reqId} - Company with ID:${companyId} has been updated - ${JSON.stringify(
            companyData,
          )}`,
        );
        return company.refresh();
      })
      .catch((error) => {
        if (error.code === 'ER_DUP_ENTRY') {
          const constraint = /Duplicate entry '.+' for key 'companies_(.+)_unique'/i.exec(
            error.message,
          )[1];
          if (constraint === 'country_name') {
            const nameSegment = name ? `name '${name}'` : 'same name';
            const countrySegment = code ? `country ${code}` : 'same country';
            throw new errors.CompanyAlreadyCreated(
              `A company with the ${nameSegment} exists in the ${countrySegment}`,
            );
          }
          if (constraint === 'slug') {
            throw new errors.CompanyAlreadyCreated(
              `The slug ${companyData.slug} is already in use`,
            );
          }
        }
        if (error.message === 'No Rows Updated') {
          logger.error(
            `Request ID: ${reqId} - This company ${companyId} does not exist`,
          );
          throw new errors.CompanyNotFound('This company does not exist');
        }
        throw error;
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - There was an error updating company ${companyId} - ${error}`,
        );
        throw error;
      });
  }

  /**
   * Get all the companies in the application
   * @return {Object} -  This object contains all the companies in the application
   */
  list() {
    const reqId = shortid.generate();

    logger.info(`Request ID: ${reqId} - Get all companies`);
    return new Company()
      .fetchAll()
      .then((companies) => {
        if (companies) {
          logger.info(`Request ID: ${reqId} - Gotten all companies`);
          return companies;
        }
        logger.error(
          `Request ID: ${reqId} - There are no companies at the moment`,
        );
        throw new errors.CompanyNotFound(
          'There are no companies at the moment',
        );
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - There was an error getting all companies: - ${error}`,
        );
        throw error;
      });
  }

  /**
   * Update a company's logo
   * @param  {Number} companyId      id of company whose logo to update
   * @param  {string} logoDataUri    the new logo as a data uri
   * @param  {Number} currentUser.id id of the user making this request
   */

  updateLogo(companyId, logoDataUri, currentUser) {
    const reqId = shortid.generate();
    return Company.where({ id: companyId })
      .fetch()
      .then((company) => {
        if (!company) {
          logger.info(
            `Request ID: ${reqId} - Tried updating logo for company ${companyId} which doesn't exist`,
          );
          throw new errors.CompanyNotFound('Company not found');
        }
        logger.info(
          `Request ID: ${reqId} - Uploading logo for company ${companyId} to S3`,
        );
        return uploadUtil
          .uploadImage('company_logos', shortid.generate(), logoDataUri)
          .then((result) => {
            logger.info(
              `Request ID: ${reqId} - Successfully uploaded logo for company ${companyId} to S3`,
            );
            return company
              .save(
                { logo_url: result.url },
                { patch: true, user_id: currentUser.id },
              )
              .then(() => {
                logger.info(
                  `Request ID: ${reqId} - Successfully updated logo of company ${companyId}`,
                );
                return company.refresh();
              });
          })
          .catch((error) => {
            logger.error(
              `Request ID: ${reqId} - Error updating company logo: - ${error}`,
            );
            throw error;
          });
      });
  }

  delete(req) {
    const companyId = req.params.company_id;

    return bookshelf.transaction((trx) => {
      trx.user_id = req.user.id;
      return new Company({ id: companyId }).fetch().then((company) => {
        if (!company) {
          throw new errors.CompanyNotFound('Company does not exist');
        }
        return company.destroy({ transacting: trx });
      });
    });
  }
}

module.exports = new CompanyService(logger);
