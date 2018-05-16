const roles = require('./roles');
const users = require('./users');
const companies = require('./companies');
const branches = require('./branches');
const products = require('./products');
const audits = require('./audits');
const workflows = require('./workflows');
const passwordReset = require('./password_reset');
const applications = require('./applications');
const s3UploadsHandler = require('./s3-uploads-handler');
const reports = require('./reports');
const activation = require('./activation');
const analysisSchemas = require('./analysis-schemas');
const configurations = require('./configurations');
const contracts = require('./contracts');
const tokens = require('./tokens');
const apps = require('./apps');
const user = require('../controllers/user');
const activationController = require('../controllers/activation');
const validators = require('../validations/common');
const Joi = require('joi');

function corsHandler(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization',
  );
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader(
    'Access-Control-Expose-Headers',
    'X-Api-Version, X-Request-Id, X-Response-Time',
  );
  res.setHeader('Access-Control-Max-Age', '1000');
  return next();
}

function optionsRoute(req, res, next) {
  res.send(200);
  return next();
}

/**
 * API Routes
 */
module.exports = (server) => {
  server.opts('/.*/', corsHandler, optionsRoute);

  server.get(
    {
      path: '/health',
      name: 'health',
      requireAuthentication: false,
    },
    (req, res) => res.send('Ok'),
  );

  server.post(
    {
      path: '/login',
      name: 'user_login',
      requireAuthentication: false,
      validation: {
        body: Joi.object()
          .keys({
            email: Joi.string()
              .email()
              .required(),
            password: Joi.string().required(),
          })
          .required(),
      },
    },
    (req, res, next) => user.login(req, res, next),
  );

  server.post(
    {
      path: 'activate/:activation_code',
      name: 'activate_user',
      requireAuthentication: false,
      validation: {
        body: {
          password: validators.password,
          confirm_password: validators.password,
        },
      },
    },
    (req, res, next) => activationController.activate(req, res, next),
  );

  server.post(
    {
      path: 'activation_code/:activation_code/validate',
      name: 'validate_activation',
      requireAuthentication: false,
    },
    (req, res, next) =>
      activationController.validateActivationCode(req, res, next),
  );

  s3UploadsHandler(server);
  passwordReset(server);

  roles(server);
  users(server);
  companies(server);
  branches(server);
  products(server);
  audits(server);
  workflows(server);
  applications(server);
  reports(server);
  activation(server);
  analysisSchemas(server);
  configurations(server);
  contracts(server);
  tokens(server);
  apps(server);
};
