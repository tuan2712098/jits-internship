/**
 * Comments Service
 * Business logic cho comment CRUD
 */

const Comment = require("../models/comment.model");
const Post = require("../models/post.model");

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function getCommentsByPost(postId) {
  const post = await Post.findById(postId).lean();
  if (!post) throw httpError("Post not found", 404);

  return Comment.find({ post: postId })
    .sort({ createdAt: 1 })
    .populate({ path: "author", select: "name" })
    .lean();
}

async function addComment(postId, { content }, authorId) {
  const post = await Post.findOne({ _id: postId, published: true }).lean();

  if (!post) {
    throw httpError("Post not found or not published", 404);
  }

  const comment = await Comment.create({
    content,
    post: postId,
    author: authorId,
  });

  await comment.populate({ path: "author", select: "name" });
  return comment;
}

async function deleteComment(commentId, currentUserId, currentUserRole) {
  const comment = await Comment.findById(commentId);

  if (!comment) throw httpError("Comment not found", 404);

  const isOwner = comment.author.toString() === currentUserId.toString();

  if (!isOwner && currentUserRole !== "admin") {
    throw httpError("You can only delete your own comments", 403);
  }

  await Comment.findByIdAndDelete(commentId);
  return { message: "Comment deleted" };
}

module.exports = {
  getCommentsByPost,
  addComment,
  deleteComment,
};
