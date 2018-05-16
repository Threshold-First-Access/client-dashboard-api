const joi = require('joi');

const reg = /^[a-z0-9\-_]{1,255}$/;

function createWorkflowValidation() {
  return {
    params: {
      product_id: joi.number().required(),
    },
    body: joi.object().keys({
      name: joi.string().required(),
      slug: joi
        .string()
        .regex(reg)
        .required(),
      test_mode_enabled: joi.boolean().strict(),
    }),
  };
}

function updateWorkflowValidation() {
  return {
    params: {
      workflow_id: joi.string().required(),
    },
    body: joi
      .object()
      .keys({
        name: joi.string(),
        slug: joi.string().regex(reg),
        test_mode_enabled: joi.boolean().strict(),
      })
      .or('name', 'slug', 'test_mode_enabled'),
  };
}

module.exports = {
  createWorkflowValidation,
  updateWorkflowValidation,
};
