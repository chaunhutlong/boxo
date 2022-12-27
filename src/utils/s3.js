const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { S3Enum } = require('../config/s3.enum');

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const SIGNED_URL_EXPIRES_SECONDS = 60 * 60; // 1 hour

function awsS3Connection(bucketName) {
  //If S3Enum contains bucketName as parameter
  const bucketIndex = S3Enum.indexOf(bucketName);
  let BUCKET;
  let s3;

  switch (bucketIndex) {
    case 0: {
      BUCKET = process.env.AWS_S3_BOOK_IMAGE_BUCKET;

      s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_BOOK_IMAGE_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_BOOK_IMAGE_SECRET_KEY,
        endpoint: process.env.AWS_S3_ENDPOINT,
      });

      break;
    }
    case 1: {
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
    s3: s3,
    bucket: BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, fileName);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter: function (req, file, cb) {
      if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(httpStatus.BAD_REQUEST, 'File type is not allowed'), false);
      }
    },
  });

  return upload;
}

function getSignedUrl(BUCKET, fileName) {
  const { s3 } = awsS3Connection(BUCKET);

  const params = {
    Bucket: BUCKET,
    Key: fileName,
    Expires: SIGNED_URL_EXPIRES_SECONDS,
  };

  return s3.getSignedUrl('getObject', params);
}

module.exports = {
  awsS3Connection,
  uploadFileToS3,
  getSignedUrl,
};
