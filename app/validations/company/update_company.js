/**
 * Validation for updating a new company
 */
const Joi = require('joi');
const countries = require('country-list')();

const schema = {
  params: {
    id: Joi.number().required(),
  },
  body: Joi.object()
    .keys({
      name: Joi.string(),
      country: Joi.string()
        .valid(countries.getCodes())
        .max(2),
      country_name: Joi.string(),
      timezone: Joi.string(),
      currency: Joi.string(),
      language: Joi.string(),
      test_mode_enabled: Joi.boolean().strict(),
    })
    .or('name', 'country', 'country_name', 'timezone', 'currency', 'language'),
};

module.exports = schema;
