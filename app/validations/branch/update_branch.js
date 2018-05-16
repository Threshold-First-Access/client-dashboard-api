/**
 * Validation for updating a company branch
 */
const Joi = require('joi');

const schema = {
  params: {
    branch_id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

module.exports = schema;
