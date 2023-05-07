const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const stream = require('stream');
const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { bucket } = require('../config/s3.enum');

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
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

async function uploadImagesBase64(bucketName, parsedImages, fileName) {
  const { s3 } = awsS3Connection(bucketName);

  const uploadPromises = parsedImages.map((image, index) => {
    const pass = new stream.PassThrough();
    pass.end(image.data);

    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}-${fileName}-${index}.${image.type.split('/')[1]}`,
      Body: pass,
      ContentType: image.type,
    };

    return s3.upload(params).promise();
  });

  return Promise.all(uploadPromises);
}

async function uploadImagesMultipart(bucket, parsedImages, fileName) {
  const { s3 } = awsS3Connection(bucket);

  const uploadPromises = parsedImages.map(async (image, index) => {
    let uploadId;
    const pass = new stream.PassThrough();
    pass.end(image.data);

    const params = {
      Bucket: bucket,
      Key: `${Date.now()}-${fileName}-${index}.${image.type.split('/')[1]}`,
    };

    const multipartUpload = await s3.createMultipartUpload(params).promise();

    uploadId = multipartUpload.UploadId;

    const uploadPromises = [];

    const partSize = 1024 * 1024 * 5; // 5MB
    const parts = Math.ceil(image.data.length / partSize);

    for (let i = 0; i < parts; i += 1) {
      const start = i * partSize;
      const end = Math.min(start + partSize, image.data.length);

      const partParams = {
        Body: image.data.slice(start, end),
        Bucket: bucket,
        Key: params.Key,
        PartNumber: i + 1,
        UploadId: uploadId,
      };

      uploadPromises.push(s3.uploadPart(partParams).promise());
    }

    const data = await Promise.all(uploadPromises);

    const completedParts = data.map((part, index) => ({
      ETag: part.ETag,
      PartNumber: index + 1,
    }));

    const completeParams = {
      Bucket: bucket,
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

function deleteFilessFromS3(BUCKET, keys) {
  const { s3 } = awsS3Connection(BUCKET);

  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  const params = {
    Bucket: BUCKET,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
    },
  };

  return s3.deleteObjects(params).promise();
}

module.exports = {
  awsS3Connection,
  uploadFileToS3,
  getSignedUrl,
  deleteFilessFromS3,
  uploadImagesBase64,
  uploadImagesMultipart,
};
