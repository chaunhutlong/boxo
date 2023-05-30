const httpStatus = require('http-status');
const he = require('he');
const { Post } = require('../models');
const ApiError = require('../utils/ApiError');
const { parseBase64ImagesArray } = require('../utils/base64');
const { deleteFilesFromS3, uploadImagesBase64 } = require('../utils/s3');
const { bucket } = require('../config/s3.enum');

/**
 * Handle the base64 images in the content
 * Upload to S3 and replace with URL
 * @param {ObjectId} authorId
 * @param {string} content
 * @returns {Promise<{parsedContent: string, images: {key: string, url: string}[]}>}
 * @private
 */
const _parseAndUploadBase64ImagesToS3 = async (authorId, content) => {
  const parsedImages = parseBase64ImagesArray(content);
  const images = [];
  let parsedContent = content;

  if (parsedImages.length > 0) {
    const uploadedImages = await uploadImagesBase64(bucket.IMAGES, parsedImages, `post-${authorId}`, 'public-read');

    // Replace base64 images with URLs in the content
    uploadedImages.forEach((uploadedImage, index) => {
      const { Key, Location } = uploadedImage;
      const { input } = parsedImages[index];

      parsedContent = parsedContent.replace(input, Location);

      images.push({ key: Key, url: Location });
    });
  }

  // Convert HTML entities back to characters
  parsedContent = he.decode(parsedContent);

  return { parsedContent, images };
};

/**
 * Query for posts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPosts = async (filter, options) => {
  return Post.paginate(filter, options);
};

/**
 * Create a post
 * @param {ObjectId} currentUserId
 * @param {Object} postBody
 * @returns {Promise<Post>}
 */
const createPost = async (currentUserId, postBody) => {
  const { title, content } = postBody;
  const authorId = currentUserId;

  const { parsedContent, images } = await _parseAndUploadBase64ImagesToS3(authorId, content);

  const post = new Post({
    title,
    content: parsedContent,
    author: authorId,
    images,
  });

  await post.save();
  return post.populate('author').execPopulate();
};

/**
 * Get post by id
 * @param {ObjectId} postId
 * @returns {Promise<Post>}
 */
const getPostById = async (postId) => {
  const post = await Post.findById(postId).populate('author');
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  return post;
};

/**
 * Update post by id
 * @param {ObjectId} postId
 * @param {Object} updateBody
 * @returns {Promise<Post>}
 */
const updatePostById = async (postId, updateBody) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const { title } = updateBody;
  let { content } = updateBody;
  content = he.decode(content);

  // Filter out the images that are no longer present in the updated content
  const imageKeysToDelete = [];
  post.images = post.images.filter((image) => {
    if (!content.includes(image.url)) {
      imageKeysToDelete.push(image.key);
      return false;
    }
    return true;
  });

  // Delete images from S3
  if (imageKeysToDelete.length > 0) {
    await deleteFilesFromS3(bucket.IMAGES, imageKeysToDelete);
  }

  const { parsedContent, images } = await _parseAndUploadBase64ImagesToS3(post.author, content);

  post.title = title;
  post.content = parsedContent;

  // Combine the existing and new images
  post.images.push(...images);

  await post.save();
  return post;
};

/**
 * Delete post by id
 * @param {ObjectId} postId
 */
const deletePostById = async (postId) => {
  const post = await Post.findById(postId);

  // delete images from S3
  const imageKeysToDelete = post.images.map((image) => image.key);
  await deleteFilesFromS3(bucket.IMAGES, imageKeysToDelete);

  await post.remove();
};

module.exports = {
  createPost,
  queryPosts,
  getPostById,
  updatePostById,
  deletePostById,
};
