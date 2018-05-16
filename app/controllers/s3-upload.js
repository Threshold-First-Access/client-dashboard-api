const httpStatus = require('http-status');
const errors = require('../errors');
const s3UploadService = require('../services/s3-upload');

class S3UploadController {
  signPolicy(req, res, next) {
    s3UploadService
      .signPolicy(req)
      .then((result) => {
        res.send(httpStatus.OK, result);
      })
      .catch((error) => {
        if (error instanceof errors.InvalidS3Policy) {
          return res.send(httpStatus.BAD_REQUEST, { invalid: true });
        }
        return res.send(httpStatus.INTERNAL_SERVER_ERROR, {
          message: 'Internal Server Error',
        });
      })
      .then(() => next());
  }

  deleteFile(req, res, next) {
    s3UploadService
      .deleteFile(req)
      .then(() => {
        res.send(httpStatus.OK, {
          message: 'File deleted successfully.',
        });
      })
      .catch((error) => {
        res.send(httpStatus.INTERNAL_SERVER_ERROR, {
          message: error.message || 'Problem deleting file.',
        });
      })
      .then(() => next());
  }
}

module.exports = new S3UploadController();
