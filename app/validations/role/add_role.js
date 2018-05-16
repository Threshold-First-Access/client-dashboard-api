const Joi = require('joi');

const schema = {
  name: Joi.string()
    .min(2)
    .max(255)
    .required(),
  description: Joi.string().required(),
};

module.exports = schema;
