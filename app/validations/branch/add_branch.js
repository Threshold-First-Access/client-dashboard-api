/**
 * Validation for updating a company branch
 */
const Joi = require('joi');

const schema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

module.exports = schema;
