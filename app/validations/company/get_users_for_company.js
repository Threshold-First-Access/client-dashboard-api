/**
 * Validation for getting a user for a company
 */
const Joi = require('joi');

const schema = {
  id: Joi.number()
    .integer()
    .required(),
};

module.exports = schema;
