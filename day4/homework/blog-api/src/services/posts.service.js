/**
 * Posts Service
 * Business logic cho CRUD posts + publish/unpublish
 */

const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function canManage(post, currentUserId, currentUserRole) {
  return (
    post.author.toString() === currentUserId.toString() ||
    currentUserRole === "admin"
  );
}

async function getAllPosts({ page = 1, limit = 10, sort = "-createdAt", tag, published } = {}) {
  const filter = {};

  if (tag) filter.tags = tag;
  if (published !== undefined) filter.published = published;

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: "author", select: "name email" })
      .lean(),
    Post.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

async function getPostById(postId) {
  const post = await Post.findById(postId).populate({
    path: "author",
    select: "name email",
  });

  if (!post) throw httpError("Post not found", 404);
  return post;
}

async function createPost(authorId, { title, content, tags, published }) {
  const post = await Post.create({
    title,
    content,
    tags,
    published,
    author: authorId,
  });

  await post.populate({ path: "author", select: "name email" });
  return post;
}

async function updatePost(postId, updateData, currentUserId, currentUserRole) {
  const post = await Post.findById(postId);

  if (!post) throw httpError("Post not found", 404);

  if (!canManage(post, currentUserId, currentUserRole)) {
    throw httpError("You can only edit your own posts", 403);
  }

  const updated = await Post.findByIdAndUpdate(
    postId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate({ path: "author", select: "name email" });

  return updated;
}

async function deletePost(postId, currentUserId, currentUserRole) {
  const post = await Post.findById(postId);

  if (!post) throw httpError("Post not found", 404);

  if (!canManage(post, currentUserId, currentUserRole)) {
    throw httpError("You can only delete your own posts", 403);
  }

  await Promise.all([
    Post.findByIdAndDelete(postId),
    Comment.deleteMany({ post: postId }),
  ]);

  return { message: "Post deleted successfully" };
}

async function setPublished(postId, published, currentUserId, currentUserRole) {
  const post = await Post.findById(postId);

  if (!post) throw httpError("Post not found", 404);

  if (!canManage(post, currentUserId, currentUserRole)) {
    throw httpError("You can only edit your own posts", 403);
  }

  return Post.findByIdAndUpdate(
    postId,
    { published },
    { new: true, runValidators: true }
  ).populate({ path: "author", select: "name email" });
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  setPublished,
};
