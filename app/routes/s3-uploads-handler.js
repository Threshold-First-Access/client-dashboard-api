const s3UploadController = require('../controllers/s3-upload');

module.exports = (server) => {
  server.post(
    {
      path: '/s3-uploads-handler',
      name: 'sign_s3_upload',
      requireAuthentication: false,
    },
    (req, res, next) => s3UploadController.signPolicy(req, res, next),
  );

  server.del(
    {
      path: '/s3-uploads-handler/.*',
      name: 'delete_s3_upload',
      requireAuthentication: false,
    },
    (req, res, next) => s3UploadController.deleteFile(req, res, next),
  );
};
