const Joi = require('../validations/joi');
const analysisSchema = require('../controllers/analysis-schema');

module.exports = (server) => {
  server.patch(
    {
      path: 'workflows/:workflow_id/analysis_schema',
      name: 'update_analysis_schema',
      validation: {
        params: Joi.object().keys({
          workflow_id: Joi.alternatives(
            Joi.string()
              .guid()
              .required(),
            Joi.number()
              .positive()
              .required(),
          ).required(),
        }),
        body: Joi.object()
          .keys({
            content: Joi.string()
              .yaml()
              .required(),
          })
          .required(),
      },
      authorization: {
        permissions: {
          permission: 'CAN_UPDATE_WORKFLOW_ANALYSIS_SCHEMA',
          scope: 'application',
        },
      },
    },
    (req, res, next) => analysisSchema.update(req, res, next),
  );

  server.get(
    {
      path: 'workflows/:workflow_id/analysis_schema',
      name: 'get_analysis_schema',
      authorization: {
        permissions: {
          permission: 'CAN_GET_WORKFLOW_ANALYSIS_SCHEMA',
          scope: 'application',
        },
      },
    },
    (req, res, next) => analysisSchema.get(req, res, next),
  );
};
