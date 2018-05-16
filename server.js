/* eslint-disable import/no-extraneous-dependencies */

// include dependencies
const restify = require('restify');
const versioning = require('restify-url-semver');
const cors = require('cors');
const httpStatus = require('http-status');
const shortid = require('shortid');
const ip = require('request-ip');
const validator = require('restify-joi-middleware');

const config = require('./app/config/config');
const metrics = require('./app/middlewares/metrics');
const routes = require('./app/routes');
const logger = require('./app/logger');
const requestLogger = require('./app/middlewares/request_logger');
const authentication = require('./app/middlewares/acl_authenticate');
const permissionsMiddleware = require('./app/middlewares/permissions');

// Initialize web service
const server = restify.createServer({
  name: config.appName,
  versions: ['1.0.0'],
});

// Setup compression of responses
server.use(restify.gzipResponse());

// Set up allowed headers for CORS issues.
server.use(
  restify.CORS({
    origins: ['*'],
    credentials: true,
    headers: ['Origin, X-Requested-With, Content-Type, Accept'],
    methods: ['GET', 'PUT', 'PATCH', 'DELETE', 'POST', 'OPTIONS'],
  }),
);
server.use(restify.fullResponse());
server.use(cors());

// set API versioning and allow trailing slashes
server.pre(restify.pre.sanitizePath());
server.pre(versioning({ prefix: '/' }));

// set request handling and parsing
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Add source_ip and trace id to request object
server.use((req, res, next) => {
  req.sourceIp = ip.getClientIp(req);
  req.faTraceId = shortid.generate();
  next();
});

// Add metrics
server.use(metrics());

server.on('after', requestLogger);

server.use([
  authentication.parseToken,
  authentication.verifyPersonalAccessToken,
  authentication.verifyJwt,
  authentication.verifyClientApp,
  authentication.authenticate,
  authentication.auditPersonalAccessToken,
  authentication.getPermissions,
]);

server.use(permissionsMiddleware);

// Validator
server.use(
  validator(
    {
      allowUnknown: true,
    },
    {
      keysToValidate: ['params', 'body', 'query'],
      // changes how joi errors are transformed to be returned
      errorTransformer: (validationInput, joiError) => {
        const error = new Error();
        error.statusCode = httpStatus.BAD_REQUEST;
        error.body = {};
        error.body.code = 'BadRequest';
        error.body.message = joiError.details[0].message;
        error.body.data = {
          path: joiError.details[0].path,
          type: joiError.details[0].type,
          context: joiError.details[0].context,
        };
        return error;
      },

      // changes how errors are returned
      errorResponder: (error, req, res, next) => {
        return next(error);
      },
    },
  ),
);

// Set up routes
routes(server);

// start server
server.listen(config.webserver.port, () => {
  logger.info('%s listening at %s', server.name, server.url);
});

// for regression tests purpose
module.exports = server;
