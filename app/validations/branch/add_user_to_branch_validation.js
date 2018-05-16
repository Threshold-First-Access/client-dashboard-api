const Joi = require('joi');

module.exports = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
    user_id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    assign: Joi.boolean().required(),
  },
};
