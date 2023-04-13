const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { S3Enum } = require('../config/s3.enum');

const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const SIGNED_URL_EXPIRES_SECONDS = 60 * 60; // 1 hour

function awsS3Connection(bucketName) {
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
    s3,
    bucket: BUCKET,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(httpStatus.BAD_REQUEST, 'File type is not supported'), false);
      }
    },
  });

  return upload;
}

async function uploadBase64ToS3(bucketName, base64String, fileName) {
  const { s3 } = awsS3Connection(bucketName);
  const decodedImage = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const params = {
    Bucket: bucketName,
    Key: `${Date.now().toString()}-${fileName}`,
    Body: decodedImage,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
  };

  if (decodedImage.length > MAX_FILE_SIZE) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File size is too large');
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
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

function deleteFileFromS3(BUCKET, key) {
  const { s3 } = awsS3Connection(BUCKET);

  const params = {
    Bucket: BUCKET,
    Key: key,
  };

  return s3.deleteObject(params).promise();
}

module.exports = {
  awsS3Connection,
  uploadFileToS3,
  getSignedUrl,
  deleteFileFromS3,
  uploadBase64ToS3,
};
