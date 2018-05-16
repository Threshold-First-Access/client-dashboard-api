const shortid = require('shortid');
const AWS = require('aws-sdk');
const yaml = require('js-yaml');
const fuzzy = require('fuzzy');
const _ = require('lodash');
const Ajv = require('ajv');
const { mapOutputs } = require('@firstaccess/analysis-outputs-mapper');

const util = require('./util');
const Application = require('../../models/application');
const AppraisalHistory = require('../../models/appraisal_history');
const WorkflowState = require('../../models/workflow_state');
const Note = require('../../models/note');
const errors = require('../../errors');
const bookshelf = require('../../bookshelf');
const logger = require('../../logger');
const decisionSchema = require('../../validations/application/decision-schema');

const ajv = new Ajv();

const addMonths = (months) => (date) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const APPRAISAL_DOWNLOAD_MAX_RANGE_IN_MONTHS = 1;

/* eslint-disable no-underscore-dangle */
class ApplicationService {
  /**
   * Application Service contructor
   *
   * @constructor
   */
  constructor() {
    this.lambda = new AWS.Lambda({
      region: process.env.SCORING_ENGINE_REGION,
      apiKey: process.env.SCORING_ENGINE_VERSION,
    });

    this.params = {
      FunctionName: process.env.SCORING_ENGINE_NAME,
      Payload: null,
    };

    this.dataUpdaterLambda = new AWS.Lambda({
      region: process.env.DATA_UPDATER_REGION,
      apiKey: process.env.DATA_UPDATER_VERSION,
    });

    this.dataUpdaterParams = {
      FunctionName: process.env.DATA_UPDATER_NAME,
      Payload: null,
    };
  }

  /**
   * Saves an application
   *
   * @param {Object} req request object
   * @param {Number} authenticatedUser id of the authenticated user
   */
  create(req) {
    const workflowId = req.params.workflow_id || req.body.workflow_id;
    const reqId = shortid.generate();
    logger.info(
      `Request ID: ${reqId} - Fetching workflow with id ${workflowId}`,
    );
    return new WorkflowState()
      .where({ workflow_id: workflowId, end_date: null })
      .fetch({ withRelated: ['workflow.product.company', 'configuration'] })
      .then((workflowState) => {
        const product = workflowState.related('workflow').related('product');

        // Validate workflow state of application
        if (!workflowState) {
          logger.error(
            `Request ID: ${reqId} - Workflow with id ${workflowId} does not exist`,
          );
          throw new errors.WorkflowNotFound('Workflow does not exist');
        }

        if (product.get('type') === 'group') {
          throw new errors.UnsupportedProduct(
            'Group appraisals not supported yet',
          );
        }

        return workflowState;
      })
      .then((workflowState) => {
        // Validate application data against jsonschema
        const { data = {} } = req.body || {};
        const configuration = workflowState
          .related('configuration')
          .serialize();
        const validationResult = util.validate({
          data,
          configuration,
          shallowValidation: true,
        });

        if (!validationResult.valid) {
          throw errors.InvalidAppraisal(JSON.stringify(validationResult));
        }

        return workflowState;
      })
      .then((workflowState) => {
        const workflow = workflowState.related('workflow');
        const product = workflow.related('product');
        const company = product.related('company');
        const { test, data = {} } = req.body || {};

        let testModeTrigger;
        if (company.get('test_mode_enabled')) {
          testModeTrigger = `your company ${company.get(
            'name',
          )} is in test mode`;
        } else if (product.get('test_mode_enabled')) {
          testModeTrigger = `the product ${product.get(
            'name',
          )} is in test mode`;
        } else if (workflow.get('test_mode_enabled')) {
          testModeTrigger = `the workflow ${workflow.get(
            'name',
          )} of the product ${product.get('name')} is in test mode`;
        } else if (req.user.test_mode_enabled) {
          testModeTrigger = 'you are in test mode';
        }

        if (testModeTrigger && test === false) {
          throw new errors.ActionForbidden(
            `Cannot create a non-test application because ${testModeTrigger}`,
          );
        }

        return workflowState.related('applications').create(
          {
            user_id: req.user.id,
            client_id: req.clientApp ? req.clientApp.id : null,
            test: test || !!testModeTrigger,
            workflow_id: workflowState.get('workflow_id'),
            workflow_state_id: workflowState.get('id'),
            data: JSON.stringify(data),
          },
          {
            user_id: req.user.id,
          },
        );
      })
      .then((savedApplication) =>
        savedApplication.refresh({
          withRelated: [
            'workflow.product',
            'workflow_state',
            'workflow_state.configuration',
          ],
        }),
      )
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - application not saved/updated: ${error}`,
        );
        throw error;
      });
  }

  find(req) {
    const {
      user_id: userId,
      branch_id: branchId,
      company_id: companyId,
      workflow_id: workflowId,
      product_id: productId,
      completed,
      eligible,
      status,
      test,
      sort_by: sortBy,
      sort_asc: sortAscending,
      updated_since: updatedSince,
      deleted,
    } = req.query;
    return new Application().query((qb) => {
      const whereClauses = [];
      const bindings = [];
      const sortable = ['updated_at', 'created_at', 'submitted_at'];

      if (userId) {
        whereClauses.push('users.id in (?)');
        bindings.push(userId);
      }
      if (branchId) {
        whereClauses.push('users.branch_id in (?)');
        bindings.push(branchId);
      }
      if (companyId) {
        whereClauses.push('companies.id in (?)');
        bindings.push(companyId);
      }
      if (workflowId) {
        whereClauses.push('workflows.id in (?)');
        bindings.push(workflowId);
      }
      if (productId) {
        whereClauses.push('products.id in (?)');
        bindings.push(productId);
      }
      if (completed) {
        whereClauses.push('appraisals.completed in (?)');
        bindings.push(completed);
      }
      if (eligible) {
        whereClauses.push('appraisals.eligible in (?)');
        bindings.push(eligible);
      }
      if (test) {
        whereClauses.push('appraisals.test in (?)');
        bindings.push(test);
      }
      if (updatedSince) {
        // Validate the date
        const ts = Date.parse(updatedSince);
        if (isNaN(ts)) {
          logger.warn(
            `Invalid query parameter for 'updated_since': ${updatedSince}`,
          );
        } else {
          whereClauses.push('appraisals.updated_at > (?)');
          bindings.push(new Date(ts).toLocaleString());
        }
      }

      const statusList =
        status && !Array.isArray(status) ? [status] : status || [];
      if (statusList.length) {
        const statusWhereClauses = [];
        if (statusList.includes('pending')) {
          statusWhereClauses.push('appraisals.approval_at is null');
        }
        if (statusList.includes('denied')) {
          statusWhereClauses.push(
            'appraisals.approval_at is not null and appraisals.approved = 0',
          );
        }
        if (statusList.includes('approved')) {
          statusWhereClauses.push('appraisals.approved = 1');
        }
        whereClauses.push(`(${statusWhereClauses.join(' or ')})`);
      }

      // Filter out deleted appraisals based on deleted flag.
      if (!deleted || deleted === 'false') {
        whereClauses.push(`appraisals.deleted_at is null`);
      }

      if (status === 'pending') {
        whereClauses.push('appraisals.approval_at is null');
      } else if (status === 'approved') {
        whereClauses.push(
          'appraisals.approval_at is not null and appraisals.approved = ?',
        );
        bindings.push(1);
      } else if (status === 'denied') {
        whereClauses.push(
          'appraisals.approval_at is not null and appraisals.approved = ?',
        );
        bindings.push(0);
      }

      qb
        .join('users', 'users.id', '=', 'appraisals.user_id')
        .join(
          'workflow_states',
          'workflow_states.id',
          '=',
          'appraisals.workflow_state_id',
        )
        .join('workflows', 'workflows.id', '=', 'workflow_states.workflow_id')
        .join('products', 'products.id', '=', 'workflows.product_id')
        .join('companies', 'companies.id', '=', 'products.company_id')
        .whereRaw(whereClauses.join(' and '), bindings);

      if (sortable.includes(sortBy)) {
        qb.orderBy(sortBy, sortAscending ? 'asc' : 'desc');
      } else {
        qb.orderBy('updated_at', 'desc');
      }
    });
  }

  list(req) {
    return this.find(req)
      .fetchAll({
        withRelated: [
          'workflow_state.workflow.product',
          'workflow_state.configuration',
          'history',
        ],
        withDeleted: true, // must include deleted workflows
      })
      .then((applications) => {
        const sortable = ['name', 'amount'];
        const { sort_by: sortBy, sort_asc: sortAscending } = req.query;

        const compare = (firstApplication, secondApplication) => {
          const firstValue = firstApplication[sortBy];
          const secondValue = secondApplication[sortBy];
          if (
            (firstValue != null && secondValue == null) ||
            firstValue < secondValue
          ) {
            return sortAscending ? 1 : -1;
          }
          if (
            (firstValue == null && secondValue != null) ||
            firstValue > secondValue
          ) {
            return sortAscending ? -1 : 1;
          }
          return 0;
        };

        if (sortable.includes(sortBy)) {
          return applications.serialize().sort(compare);
        }

        return applications.serialize();
      })
      .then((applications) => {
        const { name } = req.query;
        if (!name) {
          return applications;
        }
        return fuzzy
          .filter(name, applications, {
            pre: '<',
            post: '>',
            extract: (application) => application.name || '',
          })
          .map((result) => result.original);
      })
      .then((applications) => {
        let { page = 1, page_size: pageSize = 10 } = req.query;
        if (page < 1) {
          page = 1;
        }
        // pageSize < 1 was previously used to get all appraisals so we will use
        // the maximum page size for that case as it is closest to all

        if (pageSize < 1 || pageSize > 500) {
          pageSize = 500;
        }
        return {
          page,
          total: applications.length,
          applications: applications.slice(
            (page - 1) * pageSize,
            page * pageSize,
          ),
        };
      });
  }

  listInfo(req) {
    const getFilterOptions = (applications, groupBy, getOptionLabel) => {
      const groupedApplications = applications.groupBy(groupBy);
      const options = Object.keys(groupedApplications);
      return options.reduce(
        (accumulated, option) =>
          Object.assign(accumulated, {
            [option]:
              typeof getOptionLabel === 'function'
                ? getOptionLabel(groupedApplications[option][0], option)
                : getOptionLabel[option],
          }),
        {},
      );
    };
    return this.find(req)
      .fetchAll({ withRelated: ['workflow.product', 'user'] })
      .then((applications) => {
        const filters = [
          {
            name: 'eligible',
            label: 'Eligibility',
            options: getFilterOptions(applications, 'eligible', {
              1: 'Eligible',
              0: 'Ineligible',
            }),
          },
          {
            name: 'status',
            label: 'Status',
            options: getFilterOptions(
              applications,
              (application) => {
                if (application.get('approval_at')) {
                  return application.get('approved') ? 'approved' : 'denied';
                }
                return 'pending';
              },
              (application, option) => _.capitalize(option),
            ),
          },
          {
            name: 'user_id',
            label: 'Users',
            options: getFilterOptions(
              applications,
              'user_id',
              (application) =>
                application.related('user').fullName() +
                (application.related('user').get('id') === req.user.id
                  ? ' (You)'
                  : ''),
            ),
          },
          {
            name: 'product_id',
            label: 'Products',
            options: getFilterOptions(
              applications,
              (application) =>
                application.related('workflow').get('product_id'),
              (application) =>
                application
                  .related('workflow')
                  .related('product')
                  .get('name'),
            ),
          },
          {
            name: 'test',
            label: 'Mode',
            options: applications.some((a) => a.get('test'))
              ? { 1: 'Test', 0: 'Live' }
              : { 0: 'Live' },
          },
        ];
        return {
          count: applications.size(),
          filters,
        };
      });
  }

  get(applicationId, requestId) {
    const reqId = requestId || shortid.generate();
    return new Application({ id: applicationId })
      .where({ deleted_at: null })
      .fetch({
        withRelated: [
          'workflow_state.configuration',
          'workflow_state.workflow.product',
          'workflow_state.analysisSchema',
          'user',
          {
            history: (qb) => qb.orderBy('created_at', 'DESC'),
          },
          'history.user',
        ],
        withDeleted: true, // include previously deleted workflows
      })
      .then((result) => {
        if (!result) {
          throw new errors.ApplicationNotFound('Application does not exist');
        }
        const application = result.serialize();

        // If application is completed, call map method
        // If there is any error during mapping, return a null mapped_response
        if (application.completed) {
          try {
            const scoringResponse = JSON.parse(application.scoring_response);

            scoringResponse.evaluation.outputs = mapOutputs({
              data: application.data,
              outputs: scoringResponse.evaluation.outputs,
              analysisSchema: yaml.load(
                application.workflow.analysisSchema.content,
              ),
              configurationSchema:
                application.workflow.configuration.schema.schema,
            });

            application.mapped_response = scoringResponse;
          } catch (error) {
            logger.warn(
              `Request ID: ${reqId} - Error mapping analysis schema through ouput for application with ID
              ${application.id}: ${error.message}`,
            );
            application.mapped_response = null;
          }
        }

        return application;
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error fetching application with ID ${applicationId}
          ${error.message}`,
        );
        throw error;
      });
  }

  update(req) {
    const reqId = shortid.generate();
    const update = {};
    return new Application({ id: req.params.application_id })
      .fetch({
        withRelated: [
          'workflow_state.configuration',
          'workflow_state.workflow.product',
        ],
      })
      .then((application) => {
        if (!application) {
          throw new errors.ApplicationNotFound('Application does not exist');
        }
        return application;
      })
      .then((application) => {
        const { data = {} } = req.body || {};
        const configuration = application
          .related('workflow_state')
          .related('configuration')
          .serialize();
        const validationResult = util.validate({
          data,
          configuration,
          shallowValidation: true,
        });

        if (!validationResult.valid) {
          throw errors.InvalidAppraisal(JSON.stringify(validationResult));
        }
        return application;
      })
      .then((application) => {
        const { test, data, decision } = req.body || {};

        if (data && application.get('completed')) {
          throw new errors.CompletedAppraisal(
            'Cannot update a completed appraisal',
          );
        }

        if (test != null) {
          update.test = test;
        }

        if (data) {
          update.data = JSON.stringify(data);
        }

        if (decision) {
          if (!application.get('completed')) {
            throw new errors.IncompleteApplication(
              'Application is not complete yet',
            );
          }

          const validateDecision = ajv.compile(decisionSchema);
          if (!validateDecision(decision)) {
            const error = new errors.InvalidDecisionObject(
              'Invalid decision object',
            );
            error.errors = validateDecision.errors
              .filter(
                (err) => err.keyword !== 'enum' && err.keyword !== 'oneOf',
              )
              .map((err) => `decision${err.dataPath} ${err.message}`);
            throw error;
          }

          update.decision = JSON.stringify(decision);
          update.approval_at = new Date();
          update.approved = decision.approved;
        }

        return application
          .save(update, {
            patch: true,
            user_id: req.user.id,
          })
          .then((app) => {
            // TODO: Refactor: break out invocation of the data updater lambda
            //  into a function that can be called here
            if (update.decision || update.test != null) {
              const payload = {
                id: app.get('id'),
                test: !!app.get('test'),
              };

              if (app.has('decision')) {
                const appDecision = JSON.parse(app.get('decision'));
                payload.decision = {
                  status: appDecision.approved ? 'approved' : 'denied',
                  rationale: appDecision.rationale,
                };

                if (appDecision.terms) {
                  const { amount, interest_rate, tenor } = appDecision.terms;
                  payload.decision.terms = {
                    amount,
                    interest_rate,
                    tenor,
                  };
                }
              }

              this.dataUpdaterParams.Payload = JSON.stringify({
                Records: [payload],
              });

              this.dataUpdaterLambda
                .invoke(this.dataUpdaterParams)
                .promise()
                .then((res) => {
                  logger.info(
                    `Request ID: ${reqId}: Payload submitted to data updater ${JSON.stringify(
                      res,
                    )}`,
                  );
                })
                .catch((error) => {
                  logger.error(
                    `Request ID: ${reqId}: Error sending payload to data updater: ${
                      error.message
                    }`,
                  );
                });
              return app;
            }
            return app;
          })
          .then((appraisal) => {
            return new AppraisalHistory()
              .save(
                {
                  appraisal_id: appraisal.get('id'),
                  eligible: appraisal.get('eligible'),
                  approved: appraisal.get('approved'),
                  scoring_response: JSON.stringify(
                    appraisal.get('scoring_response'),
                  ),
                  data: JSON.stringify(appraisal.get('data')),
                  decision: appraisal.get('decision'),
                  action: 'UPDATE_DECISION',
                  source_ip: req.sourceIp,
                  user_id: req.user.id,
                  client_id: req.clientApp ? req.clientApp.id : null,
                },
                { user_id: req.user.id },
              )
              .then(() => appraisal);
          });
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error updating application with id ${
            req.params.application_id
          } ${error.message}`,
        );
        throw error;
      });
  }

  /**
   * Saves a note
   *
   * @param {Object} req request object
   * @param {Number} authenticatedUser id of authenticated user
   */
  saveNote(req, authenticatedUser) {
    const reqId = shortid.generate();
    const applicationId = req.params.application_id;
    const noteData = Object.assign({}, req.body, {
      application_id: applicationId,
    });

    return Application.forge({ id: applicationId })
      .fetch()
      .then((application) => {
        if (!application) {
          logger.error(`Request ID: ${reqId} - application not found`);
          throw errors.ApplicationNotFound('Application does not exist');
        }
        logger.info(
          `Request ID: ${reqId} - saving note ${JSON.stringify(noteData)}`,
        );
        return Note.forge()
          .save(noteData, { user_id: authenticatedUser })
          .then((savedData) => {
            logger.info(
              `Request ID: ${reqId} - saved note ${JSON.stringify(savedData)}`,
            );
            return savedData;
          });
      })
      .catch((error) => {
        logger.error(`Request ID: ${reqId} - note not saved`);
        throw error;
      });
  }

  /**
   * Save and submit a loan appraisal
   *
   * @param {Object} req restify request object
   */
  submitNewApplication(req) {
    return this.create(req).then((appraisal) =>
      this.submitApplication({
        params: { application_id: appraisal.id },
        user: req.user,
      }),
    );
  }

  /**
   * Submit loan application for scoring
   *
   * @param {Object} req restify request object or appraisal object
   */
  submitApplication(req) {
    const reqId = shortid.generate();
    const applicationId = req.params.application_id;

    return Application.forge({ id: applicationId })
      .fetch({
        withRelated: [
          'workflow_state.workflow.product.company',
          'workflow_state.configuration',
          'workflow_state.contract',
          'user',
          'branch',
          'history.user',
        ],
      })
      .then((application) => {
        if (!application) {
          logger.error(`Request ID: ${reqId} - application not found`);
          throw errors.ApplicationNotFound('Application does not exist');
        }
        return application;
      })
      .then((result) => {
        const { data, workflow: { configuration } } = result.serialize();

        const validationResult = util.validate({ data, configuration });

        if (!validationResult.valid) {
          throw errors.InvalidAppraisal(JSON.stringify(validationResult));
        }

        return result;
      })
      .then((application) => {
        const submittedAt = new Date();

        this.params.Payload = JSON.stringify(
          this.structureScoringData(application.serialize(), submittedAt),
        );

        return this.lambda
          .invoke(this.params)
          .promise()
          .then((res) => {
            if (res.FunctionError) {
              throw new Error(JSON.parse(res.Payload).errorMessage);
            }

            logger.info(
              `Request ID: ${reqId} - Loan application, ${applicationId} got successful response from scoring engine`,
            );
            const scoringResponse = JSON.parse(res.Payload)[0];
            const eligible = JSON.parse(scoringResponse).evaluation.eligible;
            return application
              .save(
                {
                  completed: true,
                  eligible,
                  scoring_response: scoringResponse,
                  submitted_at: submittedAt,
                  state: 'SUBMITTED',
                },
                {
                  patch: true,
                  user_id: req.user.id,
                },
              )
              .then((appraisal) => {
                return new AppraisalHistory()
                  .save(
                    {
                      appraisal_id: appraisal.get('id'),
                      eligible: appraisal.get('eligible'),
                      approved: appraisal.get('approved'),
                      scoring_response: JSON.stringify(
                        appraisal.get('scoring_response'),
                      ),
                      data: JSON.stringify(appraisal.get('data')),
                      decision: appraisal.get('decision'),
                      action: 'SUBMITTED',
                      source_ip: req.sourceIp,
                      user_id: req.user.id,
                      client_id: req.clientApp ? req.clientApp.id : null,
                    },
                    { user_id: req.user.id },
                  )
                  .then(() => appraisal);
              })
              .catch((error) => {
                logger.error(
                  `Request ID: ${reqId} - Error updating score status loan application: in dashboard ${error}`,
                );
                throw error;
              });
          })
          .catch((error) => {
            logger.error(
              `Request ID: ${reqId} - Error scoring loan application: ${error}`,
            );
            throw error;
          });
      })
      .catch((error) => {
        logger.error(
          `Request ID: ${reqId} - Error submitting application: ${error}`,
        );
        throw error;
      });
  }

  /**
   * Structure the application object for scoring
   *
   * @param {Object} application - Loan application object
   * @param {Date} submittedAt - The datetime that this submission was started
   */
  structureScoringData(application, submittedAt) {
    const reqId = shortid.generate();

    const data = {
      Records: [],
    };
    const productDetails = application.workflow.product;
    const user = _.pick(application.user, ['id', 'first_name', 'last_name']);
    const company = _.pick(productDetails.company, ['id', 'name']);
    const product = _.pick(productDetails, ['id', 'name']);
    const { schema } = application.workflow.configuration.schema;
    const branch = application.branch
      ? _.pick(application.branch, ['id', 'name'])
      : null;
    const createdAt = application.created_at;
    const updatedAt = application.updated_at;
    const deletedAt = application.deleted_at;
    const approvalAt = application.approval_at;
    const contract = application.workflow.contract
      ? yaml.load(application.workflow.contract.content)
      : {};
    const _form = _.map(application.data.sections, (section) => section).reduce(
      (a, n) => Object.assign(a, n),
      {},
    );
    const decision = application.decision || { status: 'pending' };
    if (typeof decision.approved === 'boolean') {
      decision.status = decision.approved ? 'approved' : 'denied';
    }
    if (decision.terms && decision.terms.currency) {
      delete decision.terms.currency;
    }
    const record = {
      version: '1.0.0',
      id: application.id,
      test: false,
      created_at: createdAt,
      updated_at: updatedAt,
      submitted_at: submittedAt,
      deleted_at: deletedAt,
      approval_at: approvalAt,
      company,
      branch,
      user,
      product,
      decision: _.omit(decision, 'approved'),
      workflow: {
        id: application.workflow.id,
        name: application.workflow.name,
        contract,
        schema,
      },
      data: {
        _form,
      },
    };

    data.Records.push(record);
    logger.info(`Request ID: ${reqId} - ${JSON.stringify(data)}`);
    return data;
  }

  remove(req) {
    const reqId = shortid.generate();
    return Promise.resolve()
      .then(() => {
        const { application } = req;
        if (application.get('completed')) {
          throw new errors.ActionForbidden(
            'Submitted applications cannot be deleted',
          );
        }
        return bookshelf
          .knex('appraisals')
          .where('id', '=', application.get('id'))
          .update({
            updated_at: bookshelf.knex.fn.now(),
            deleted_at: bookshelf.knex.fn.now(),
            state: 'CLOSED',
          });
      })
      .then((id) => {
        return new Application({ id })
          .fetch({ withDeleted: true })
          .then((appraisal) => {
            return new AppraisalHistory()
              .save(
                {
                  appraisal_id: appraisal.get('id'),
                  eligible: appraisal.get('eligible'),
                  approved: appraisal.get('approved'),
                  scoring_response: JSON.stringify(
                    appraisal.get('scoring_response'),
                  ),
                  data: JSON.stringify(appraisal.get('data')),
                  decision: appraisal.get('decision'),
                  action: 'DELETED',
                  source_ip: req.sourceIp,
                  user_id: req.user.id,
                  client_id: req.clientApp ? req.clientApp.id : null,
                },
                { user_id: req.user.id },
              )
              .then(() => {
                logger.info(
                  `Request ID: ${reqId} - Deleted appraisal ${
                    req.params.application_id
                  }`,
                );
              });
          });
      })
      .catch((error) => {
        logger.info(
          `Request ID: ${reqId} - Failed to delete appraisal ${
            req.params.application_id
          }: ${error}`,
        );
        throw error;
      });
  }

  clone(req) {
    return Promise.resolve().then(() => {
      const application = req.application;
      if (!application.get('completed')) {
        throw new errors.IncompleteApplication(
          'Cannot duplicate an in-progress appraisal.',
        );
      }

      return new Application().save(
        {
          user_id: req.user.id,
          test: application.get('test'),
          data: application.get('data'),
          workflow_state_id: application.get('workflow_state_id'),
          workflow_id: application.get('workflow_id'),
        },
        { user_id: req.user.id },
      );
    });
  }

  reopen(req) {
    return Application.forge({ id: req.params.application_id })
      .fetch({
        withRelated: [
          'workflow_state.workflow.product.company',
          'workflow_state.configuration',
          'workflow_state.contract',
          'user',
          'history.user',
        ],
      })
      .then((appraisal) => {
        if (!appraisal.get('completed')) {
          throw new errors.IncompleteApplication(
            'Draft appraisals cannot be reopened',
          );
        }
        return appraisal;
      })
      .then((result) => {
        // Reopen the appraisal by setting incomplete and reopen state
        return bookshelf.transaction((trx) => {
          return result
            .save(
              {
                state: 'REOPENED',
                completed: false,
                decision: null,
                eligible: false,
                approved: false,
                approval_at: null,
              },
              { user_id: req.user.id, transacting: trx, patch: true },
            )
            .then((appraisal) => {
              // Update the appraisal history log
              return new AppraisalHistory()
                .save(
                  {
                    appraisal_id: appraisal.get('id'),
                    eligible: appraisal.get('eligible'),
                    approved: appraisal.get('approved'),
                    scoring_response: JSON.stringify(
                      appraisal.get('scoring_response'),
                    ),
                    data: JSON.stringify(appraisal.get('data')),
                    decision: appraisal.get('decision'),
                    action: 'REOPENED',
                    source_ip: req.sourceIp,
                    user_id: req.user.id,
                    client_id: req.clientApp ? req.clientApp.id : null,
                    comment: req.body.comment,
                  },
                  { user_id: req.user.id, transacting: trx },
                )
                .then(() => appraisal);
            });
        });
      });
  }

  download(req) {
    return Promise.resolve().then(() => {
      return new Application()
        .query((qb) => {
          const from = new Date(req.query.from);
          const to = new Date(req.query.to);
          if (addMonths(APPRAISAL_DOWNLOAD_MAX_RANGE_IN_MONTHS)(from) < to) {
            throw new errors.InvalidDateRange(
              'The range between "from" and "to" dates cannot be more than 1 month',
            );
          }
          const whereClauses = [
            'appraisals.created_at > ?',
            'appraisals.created_at < ?',
          ];
          const bindings = [from, to];

          if (req.query.completed != null) {
            whereClauses.push('appraisals.completed in (?)');
            bindings.push(req.query.completed);
          }

          const permission = req.user.permissions.find((p) => {
            return p.permission === 'CAN_GET_APPLICATIONS';
          });

          if (req.user.superadmin) {
            // the permission doesn't apply to super admin
          } else if (!permission) {
            // users without the permission can only view appraisals
            // they created
            whereClauses.push('appraisals.user_id = ?');
            bindings.push(req.user.id);
          } else if (permission.scope === 'company') {
            qb
              .join(
                'workflow_states',
                'workflow_states.id',
                '=',
                'appraisals.workflow_state_id',
              )
              .join(
                'workflows',
                'workflows.id',
                '=',
                'workflow_states.workflow_id',
              )
              .join('products', 'products.id', '=', 'workflows.product_id');

            whereClauses.push('products.company_id = ?');
            bindings.push(req.user.company_id);
          } else {
            // the user has the permission with "application" scope so
            // we don't have to apply any permission-based filters
          }

          qb
            .join('users', 'users.id', '=', 'appraisals.user_id')
            .leftOuterJoin(
              'company_apps',
              'company_apps.id',
              '=',
              'appraisals.client_id',
            )
            .whereRaw(whereClauses.join(' and '), bindings)
            .orderBy('created_at', 'desc');
        })
        .fetchAll({
          columns: [
            'appraisals.id',
            'appraisals.eligible',
            'appraisals.workflow_id',
            'users.email as user_email',
            'appraisals.created_at',
            'appraisals.updated_at',
            'appraisals.scoring_response',
            'appraisals.approval_at',
            'appraisals.test',
            'appraisals.submitted_at',
            'appraisals.data',
            'appraisals.decision',
            'appraisals.state',
            'company_apps.access_key as app_key',
          ],
        })
        .then((appraisals) => {
          appraisals.forEach((appraisal) => {
            if (appraisal.has('scoring_response')) {
              appraisal.set(
                'scoring_response',
                JSON.parse(appraisal.get('scoring_response')),
              );
            }
          });
          return appraisals;
        });
    });
  }
}

module.exports = new ApplicationService();
