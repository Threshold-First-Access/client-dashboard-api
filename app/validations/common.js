const Joi = require('joi');

/**
 * (?=.[a-z]) atleast one lowercase character
 * (?=.*[A-Z]) atleast one uppercase letter
 * (?=.*\d) atleast one digit character
 * (?=.*[-+_!@#$%^&*.,?]) atleast one special character
 * .{8,} atleast 8 characters long
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).{8,}$/;

module.exports = {
  password: Joi.string().regex(passwordRegex),
  slug: () => Joi.string().regex(/^[a-z0-9\-_]{1,255}$/),
};
