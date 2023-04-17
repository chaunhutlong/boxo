const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { bucket } = require('../config/s3.enum');

const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
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

function uploadFile(BUCKET) {
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

async function uploadImagesBase64(bucketName, base64ImagesArray, fileName) {
  const { s3 } = awsS3Connection(bucketName);

  const uploads = base64ImagesArray.map(async (base64String) => {
    const buffer = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const key = `${Date.now().toString()}-${fileName}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
    };

    if (buffer.length > MAX_FILE_SIZE) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'File size is too large');
    }
    await s3.upload(params).promise();
    return key;
  });

  return Promise.all(uploads);
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

function deleteFile(BUCKET, key) {
  const { s3 } = awsS3Connection(BUCKET);

  const params = {
    Bucket: BUCKET,
    Key: key,
  };

  return s3.deleteObject(params).promise();
}

module.exports = {
  awsS3Connection,
  uploadFile,
  getSignedUrl,
  deleteFile,
  uploadImagesBase64,
};
