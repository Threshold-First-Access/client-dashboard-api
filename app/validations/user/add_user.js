/**
 * Validation for adding a new user
 */
const Joi = require('joi');

const schema = {
  first_name: Joi.string()
    .min(2)
    .max(24)
    .required(),
  last_name: Joi.string()
    .min(2)
    .max(24)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  company_id: Joi.number().allow(null),
  test_mode_enabled: Joi.boolean().strict(),
  activation_timeout: Joi.number()
    .min(1)
    .max(14)
    .allow(null),
};

module.exports = schema;
