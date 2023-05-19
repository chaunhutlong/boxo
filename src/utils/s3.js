const AWS = require('aws-sdk');
const stream = require('stream');
const multer = require('multer');
const multerS3 = require('multer-s3');
const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { bucket } = require('../config/s3.enum');

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const SIGNED_URL_EXPIRES_SECONDS = 60 * 60; // 1 hour

function awsS3Connection(bucketName) {
  let BUCKET;
  let s3;

  switch (bucketName) {
    case bucket.IMAGES: {
      BUCKET = process.env.AWS_S3_IMAGES_BUCKET;

      s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_IMAGES_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_IMAGES_SECRET_KEY,
        endpoint: process.env.AWS_S3_ENDPOINT,
      });
      break;
    }

    case bucket.AVATAR: {
      BUCKET = process.env.AWS_S3_AVATAR_BUCKET;

      s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_AVATAR_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_AVATAR_SECRET_KEY,
        endpoint: process.env.AWS_S3_ENDPOINT,
      });
      break;
    }
    default: {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Bucket name is not valid');
    }
  }

  return {
    s3,
    BUCKET,
  };
}

function uploadFileToS3(BUCKET) {
  const { s3 } = awsS3Connection(BUCKET);
  const storage = multerS3({
    s3,
    bucket: BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });
}

async function uploadImagesBase64(bucketName, parsedImages, fileName, accessType = 'private') {
  const { s3 } = awsS3Connection(bucketName);

  const uploadPromises = parsedImages.map((image, index) => {
    const pass = new stream.PassThrough();
    pass.end(image.data);

    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}-${fileName}-${index}.${image.type.split('/')[1]}`,
      Body: pass,
      ContentType: image.type,
      ACL: accessType,
    };

    return s3.upload(params).promise();
  });

  return Promise.all(uploadPromises);
}

async function uploadImagesMultipart(bucketName, parsedImages, fileName) {
  const { s3 } = awsS3Connection(bucketName);

  const uploadPromises = parsedImages.map(async (image, index) => {
    const pass = new stream.PassThrough();
    pass.end(image.data);

    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}-${fileName}-${index}.${image.type.split('/')[1]}`,
    };

    const multipartUpload = await s3.createMultipartUpload(params).promise();

    const uploadId = multipartUpload.UploadId;

    const partSize = 1024 * 1024 * 5; // 5MB
    const parts = Math.ceil(image.data.length / partSize);

    const partUploadPromises = [];

    for (let i = 0; i < parts; i += 1) {
      const start = i * partSize;
      const end = Math.min(start + partSize, image.data.length);

      const partParams = {
        Body: image.data.slice(start, end),
        Bucket: bucketName,
        Key: params.Key,
        PartNumber: i + 1,
        UploadId: uploadId,
      };

      partUploadPromises.push(s3.uploadPart(partParams).promise());
    }

    const partData = await Promise.all(partUploadPromises);

    const completedParts = partData.map((part, partIndex) => ({
      ETag: part.ETag,
      PartNumber: partIndex + 1,
    }));

    const completeParams = {
      Bucket: bucketName,
      Key: params.Key,
      MultipartUpload: {
        Parts: completedParts,
      },
      UploadId: uploadId,
    };

    return s3.completeMultipartUpload(completeParams).promise();
  });

  return Promise.all(uploadPromises);
}

function getSignedUrl(BUCKET, key) {
  const { s3 } = awsS3Connection(BUCKET);

  const params = {
    Bucket: BUCKET,
    Key: key,
    Expires: SIGNED_URL_EXPIRES_SECONDS,
  };

  return s3.getSignedUrl('getObject', params);
}

function deleteFilesFromS3(BUCKET, keys) {
  const { s3 } = awsS3Connection(BUCKET);

  const deleteKeys = Array.isArray(keys) ? keys : [keys];

  const params = {
    Bucket: BUCKET,
    Delete: {
      Objects: deleteKeys.map((key) => ({ Key: key })),
    },
  };

  return s3.deleteObjects(params).promise();
}

module.exports = {
  uploadFileToS3,
  getSignedUrl,
  deleteFilesFromS3,
  uploadImagesBase64,
  uploadImagesMultipart,
};
