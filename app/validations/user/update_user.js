/**
 * Validation for updating a user
 */
const Joi = require('joi');
const validators = require('../common');

const schema = {
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
  body: Joi.object()
    .keys({
      first_name: Joi.string()
        .min(2)
        .max(24),
      last_name: Joi.string()
        .min(2)
        .max(24),
      email: Joi.string().email(),
      password: validators.password,
      company_id: Joi.number()
        .integer()
        .positive(),
      branch_id: Joi.number()
        .integer()
        .allow(null),
      active: Joi.number(),
      test_mode_enabled: Joi.boolean().strict(),
    })
    .or(
      'first_name',
      'last_name',
      'email',
      'password',
      'company_id',
      'active',
      'branch_id',
      'test_mode_enabled',
    ),
};

module.exports = schema;
