const aws = require('aws-sdk');
const mime = require('mime');

/**
 * Uploads image to s3.
 *
 * @param {string}  s3Folder, folder to add the image to.
 * @param {Number}  imageId, id of image we are saving.
 * @param {string}  dataUri, base64 encoded data uri of the image.
 *
 * @returns Promise<T>
 */
function uploadImage(s3Folder, imageId, dataUri) {
  return new Promise((resolve, reject) => {
    // data URI format is data:[<media type>][;base64],<data>
    const [metaData, base64Data] = dataUri.split(',');
    const [mimeType] = metaData.split(':')[1].split(';');
    const extension = mime.extension(mimeType);
    const body = Buffer.from(base64Data, 'base64');

    const Bucket = `${process.env.AWS_BUCKET}/${s3Folder}`;
    const s3 = new aws.S3({
      params: { Bucket, Key: `${imageId}.${extension}` },
    });

    s3.upload({ Body: body, ContentType: mimeType }).send((err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        message: 'Image uploaded successfully',
        url: result.Location,
      });
    });
  });
}

module.exports = {
  uploadImage,
};
