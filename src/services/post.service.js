const httpStatus = require('http-status');
const { Post } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl, deleteFilesFromS3, uploadImagesBase64 } = require('../utils/s3');

const BUCKET = process.env.AWS_S3_IMAGE_BUCKET;

/**
 * Create a post
 * @param {Object} postBody
 * @returns {Promise<Post>}
 */
const createPost = async (currentUserId, postBody) => {
  // if content contain base64 image, upload to s3 and replace with url
  const { title, content } = postBody;
  const author = currentUserId;
  const regex = /data:image\/(png|jpg|jpeg);base64,(.*)/g;
  let match = regex.exec(content);
  const images = [];
  const index = 0;
  while (match != null) {
    let base64 = match[2];
    const filename = `post_${author}_${index}.${imageType}`;
    const url = uploadImagesBase64(BUCKET, base64, filename).then((uploadedImage) => {
      return getSignedUrl(BUCKET, uploadedImage.Key);
    });

    images.push({
      url,
      filename,
    });

    index += 1;
    match = regex.exec(content);
    console.log(match);
  }

  const post = new Post({
    title,
    content,
    author,
    images,
  });

  await post.save();
  return post;
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
  const posts = await Post.paginate(filter, options);
  return posts;
};

/**
 * Get post by id
 * @param {ObjectId} id
 * @returns {Promise<Post>}
 */
const getPostById = async (id) => {
  const post = await Post.findById(id);
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
  const post = await getPostById(postId);

  Object.assign(post, updateBody);

  await post.save();
  return post;
};

/**
 * Delete post by id
 * @param {ObjectId} postId
 */
const deletePostById = async (postId) => {
  const post = await getPostById(postId);

  await post.remove();
};

module.exports = {
  createPost,
  queryPosts,
  getPostById,
  updatePostById,
  deletePostById,
};
