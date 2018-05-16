const Joi = require('joi');
const yaml = require('js-yaml');

/**
 * See Joi.extend docs: https://github.com/hapijs/joi/blob/v10.2.2/API.md#extendextension
 */
module.exports = Joi.extend({
  base: Joi.string(),
  name: 'string',
  language: {
    yaml: 'is not a valid YAML document',
  },
  rules: [
    {
      name: 'yaml',
      validate(params, value, state, options) {
        try {
          yaml.safeLoad(value);
          return value;
        } catch (error) {
          const context = { value, error };
          return this.createError('string.yaml', context, state, options);
        }
      },
    },
  ],
});
