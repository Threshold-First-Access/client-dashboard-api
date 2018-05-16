const Joi = require('joi');

module.exports = {
  name: Joi.string()
    .min(2)
    .required(),
  type: Joi.string()
    .valid(['individual', 'group'])
    .required(),
  test_mode_enabled: Joi.boolean().strict(),
  active: Joi.boolean().strict(),
};
