const CryptoJS = require('crypto-js');
const aws = require('aws-sdk');
const errors = require('../errors');
const shortid = require('shortid');
const logger = require('../logger');

const s3 = new aws.S3();

class S3UploadService {
  constructor() {
    this.clientSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.expectedBucket = process.env.AWS_BUCKET;
  }

  signPolicy(req) {
    const reqId = shortid.generate();
    const policy = req.body;
    const base64Policy = new Buffer(JSON.stringify(policy)).toString('base64');
    const signature = this.signV4Policy(policy, base64Policy);

    return Promise.resolve().then(() => {
      if (this.isPolicyValid(req.body)) {
        logger.info(`Request ID: ${reqId} - S3 policy signed successfully`);
        return {
          policy: base64Policy,
          signature,
        };
      }
      logger.error(`Request ID: ${reqId} - S3 policy could not be signed`);
      throw new errors.InvalidS3Policy();
    });
  }

  deleteFile(req) {
    const reqId = shortid.generate();
    return s3
      .deleteObject({
        Bucket: req.query.bucket,
        Key: req.query.key,
      })
      .promise()
      .then(() => {
        logger.info(
          `Request ID: ${reqId} - File '${req.query.bucket}/${
            req.query.key
          }' deleted successfully`,
        );
      })
      .catch((error) => {
        logger.info(
          `Request ID: ${reqId} - File '${req.query.bucket}/${
            req.query.key
          }' could not be deleted`,
        );
        throw error;
      });
  }

  signV4Policy(policy, base64Policy) {
    const conditions = policy.conditions;
    let credentialCondition;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < conditions.length; i++) {
      credentialCondition = conditions[i]['x-amz-credential'];
      if (credentialCondition != null) {
        break;
      }
    }

    const matches = /.+\/(.+)\/(.+)\/s3\/aws4_request/.exec(
      credentialCondition,
    );
    return this.getV4SignatureKey(
      this.clientSecretKey,
      matches[1],
      matches[2],
      's3',
      base64Policy,
    );
  }

  getV4SignatureKey(key, dateStamp, regionName, serviceName, stringToSign) {
    const kDate = CryptoJS.HmacSHA256(dateStamp, `AWS4${key}`);
    const kRegion = CryptoJS.HmacSHA256(regionName, kDate);
    const kService = CryptoJS.HmacSHA256(serviceName, kRegion);
    const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);

    return CryptoJS.HmacSHA256(stringToSign, kSigning).toString();
  }

  isPolicyValid(policy) {
    let bucket;

    policy.conditions.forEach((condition) => {
      if (condition.bucket) {
        bucket = condition.bucket;
      }
    });
    return bucket === this.expectedBucket;
  }
}

module.exports = new S3UploadService();
