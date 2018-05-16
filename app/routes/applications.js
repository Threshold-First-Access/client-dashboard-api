const Joi = require('joi');
const Workflow = require('../models/workflow');
const Application = require('../models/application');
const { ContextNotFound } = require('../middlewares/permissions');
const application = require('../controllers/application');
const authorization = require('./authorization/applications');

function getApplicationRequestContext(req) {
  return new Application({ id: req.params.application_id })
    .fetch({
      withRelated: ['user', 'workflow.product.company'],
      withDeleted: true,
    })
    .then((model) => {
      if (!model) {
        throw new ContextNotFound('Application does not exist');
      }
      req.application = model;
      const user = model.related('user');
      const company = model
        .related('workflow')
        .related('product')
        .related('company');
      return {
        companyId: company.get('id'),
        branchId: user.get('branch_id'),
        userId: user.get('id'),
      };
    });
}

const routes = [
  {
    method: 'post',
    path: '/workflows/:workflow_id/applications',
    name: 'new_application',
    version: '1.0.0',
    validation: {
      body: Joi.object().keys({
        test: Joi.boolean().strict(),
      }),
    },
    authorization: {
      permissions: {
        permission: 'CAN_CREATE_APPLICATION',
      },
      getRequestContext: (req) =>
        new Workflow({ id: req.params.workflow_id })
          .fetch({ withRelated: ['product'] })
          .then((model) => {
            if (!model) {
              throw new ContextNotFound('Workflow does not exist');
            }
            req.workflow = model;
            return {
              companyId: model.related('product').get('company_id'),
            };
          }),
    },
    handler: (req, res, next) => application.create(req, res, next),
  },
  {
    method: 'get',
    path: '/applications',
    name: 'get_applications',
    authorization: authorization.list(),
    handler: (req, res, next) => application.list(req, res, next),
  },
  {
    method: 'get',
    path: '/applications/info',
    name: 'get_applications_info',
    authorization: authorization.list(),
    handler: (req, res, next) => application.listInfo(req, res, next),
  },
  {
    method: 'get',
    path: '/applications/download',
    name: 'download_applications',
    validation: {
      query: Joi.object().keys({
        from: Joi.date()
          .max(Joi.ref('to'))
          .required(),
        to: Joi.date()
          .max('now')
          .required(),
      }),
    },
    handler: (req, res, next) => application.download(req, res, next),
  },
  {
    method: 'get',
    path: '/applications/:application_id',
    name: 'get_application',
    authorization: {
      permissions: { permission: 'CAN_GET_APPLICATIONS' },
      getRequestContext: getApplicationRequestContext,
    },
    handler: (req, res, next) => application.get(req, res, next),
  },
  {
    method: 'patch',
    path: '/applications/:application_id',
    name: 'update_application',
    validation: {
      body: Joi.object().keys({
        test: Joi.boolean().strict(),
        data: Joi.object(),
        decision: Joi.object(),
      }),
    },
    authorization: {
      getPermissions: (req) => {
        if (req.body.decision) {
          return {
            permission: 'CAN_ADD_APPLICATION_DECISION',
          };
        }
        return { permission: 'CAN_CREATE_APPLICATION' };
      },
      getRequestContext: (req) => {
        if (req.body.decision) {
          return getApplicationRequestContext(req).then((context) => {
            delete context.userId;
            return context;
          });
        }
        return getApplicationRequestContext(req);
      },
    },
    handler: (req, res, next) => application.update(req, res, next),
  },
  {
    method: 'post',
    path: '/applications/:application_id/notes',
    name: 'new_note',
    validation: {
      body: Joi.object().keys({
        content: Joi.string().required(),
      }),
    },
    authorization: {
      permissions: {
        permission: 'CAN_ADD_APPLICATION_NOTE',
      },
      getRequestContext: getApplicationRequestContext,
    },
    handler: (req, res, next) => application.saveNote(req, res, next),
  },
  {
    method: 'post',
    path: '/applications/submit',
    name: 'submit_new_application',
    authorization: {
      permissions: {
        permission: 'CAN_SUBMIT_APPLICATION',
      },
      getRequestContext: (req) =>
        new Workflow({ id: req.body.workflow_id })
          .fetch({
            withRelated: 'product.company',
          })
          .then((result) => {
            if (!result) {
              throw new ContextNotFound('Workflow does not exist');
            }

            return {
              companyId: result
                .related('product')
                .related('company')
                .get('id'),
            };
          }),
    },
    handler: (req, res, next) =>
      application.submitNewApplication(req, res, next),
  },
  {
    method: 'post',
    path: '/applications/:application_id/submit',
    name: 'submit_application',
    authorization: {
      permissions: {
        permission: 'CAN_SUBMIT_APPLICATION',
      },
      getRequestContext: getApplicationRequestContext,
    },
    handler: (req, res, next) => application.submitApplication(req, res, next),
  },
  {
    method: 'del',
    path: '/applications/:application_id',
    name: 'delete_application',
    authorization: {
      permissions: {
        permission: 'CAN_DELETE_APPLICATION',
      },
      getRequestContext: getApplicationRequestContext,
    },
    handler: (req, res, next) => application.remove(req, res, next),
  },
  {
    method: 'post',
    path: '/applications/:application_id/clone',
    name: 'clone_application',
    authorization: {
      permissions: {
        permission: 'CAN_CREATE_APPLICATION',
      },
      getRequestContext: (req) =>
        new Application({ id: req.params.application_id })
          .fetch({ withRelated: ['workflow_state.workflow.product'] })
          .then((model) => {
            if (!model) {
              throw new ContextNotFound('Appraisal does not exist.');
            }

            req.application = model;
            return {
              companyId: model
                .related('workflow_state')
                .related('workflow')
                .related('product')
                .get('company_id'),
            };
          }),
    },
    handler: (req, res, next) => application.clone(req, res, next),
  },
  {
    method: 'post',
    path: '/applications/:application_id/reopen',
    name: 'reopen_application',
    validation: {
      body: Joi.object()
        .keys({
          comment: Joi.string().required(),
        })
        .required(),
    },
    authorization: {
      permissions: {
        permission: 'CAN_REOPEN_APPRAISAL',
      },
      getRequestContext: getApplicationRequestContext,
    },
    handler: (req, res, next) => application.reopen(req, res, next),
  },
];

module.exports = (server) => {
  routes.forEach((route) => {
    const { method, handler, ...options } = route;
    if (typeof server[method] !== 'function') {
      return;
    }
    server[method](options, handler);

    server[method](
      {
        ...options,
        path: options.path.replace('/applications', '/appraisals'),
        name: options.name.replace('application', 'appraisal'),
      },
      handler,
    );
  });
};
