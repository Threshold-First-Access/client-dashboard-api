const { validate, parseSchema } = require('@firstaccess/form-component-core');
const { map, every, filter } = require('lodash');

/**
 * Perform a shallow validation for a section (during appraisal save/update)
 * A field is considered invalid if it fails the type, enum and format json schema validations
 *
 * @param {Object} validation - validation result object for a section
 * @returns {Object} - shallow validation state of a section
 */
function shallowSectionValidation(validation) {
  const validationChecks = ['type', 'enum', 'format'];
  const errors = filter(validation.errors, (error) => {
    return validationChecks.includes(error.name);
  });

  // If the errors object has items, shallow validation failed for section
  if (errors.length) {
    return { valid: false, errors };
  }
  return { valid: true, errors };
}

module.exports = {
  /**
   * Validate Appraisal data against workflow configuration
   *
   * @param {Object} options - Validation options
   * @param {Object} options.data - Appraisal data to validate
   * @param {Object} options.configuration - Configuration to validate against
   * @param {Boolean} options.shallowValidation - if true, perform type validations only
   * @returns {Object} - Valid status(Boolean) and Error(Object)
   */
  validate({ data, configuration, shallowValidation = false }) {
    const { sections = {} } = data;
    const { schema: { schema = {} } } = configuration;

    const sectionsSchema = parseSchema(schema).sections.properties;
    // Validate the each section against the schema and return the validation result
    const validationResult = map(sectionsSchema, (section, key) => {
      return validate(sections[key] || {}, sectionsSchema[key]);
    });

    // For shallow validation only return type, enum and format errors
    const result = shallowValidation
      ? map(validationResult, shallowSectionValidation)
      : validationResult;

    // Check if there all validation results are truthy
    const isValid = every(result, (item) => item.valid);

    if (isValid) {
      return { valid: true };
    }

    return { valid: false, error: result };
  },
};
