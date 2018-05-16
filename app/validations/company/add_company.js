/**
 * Validation for adding a new company
 */
const Joi = require('joi');
const countries = require('country-list')();
const { slug } = require('../common');

const schema = {
  name: Joi.string()
    .min(2)
    .required(),
  slug: slug(),
  country: Joi.string()
    .valid(countries.getCodes())
    .max(2)
    .required(),
  test_mode_enabled: Joi.boolean().strict(),
};

module.exports = schema;
