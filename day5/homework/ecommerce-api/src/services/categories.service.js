/**
 * Categories Service
 */

"use strict";

const Category = require("../models/Category");
const Product = require("../models/Product");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getAll() {
  return Category.find().sort({ name: 1 });
}

async function getById(id) {
  const category = await Category.findById(id);

  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  return category;
}

async function create(data) {
  return Category.create({
    name: data.name,
    description: data.description,
  });
}

async function update(id, data) {
  const category = await Category.findById(id);

  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  Object.assign(category, data);
  await category.save();

  return category;
}

async function deleteCategory(id) {
  const count = await Product.countDocuments({ category: id });

  if (count > 0) {
    throw createHttpError(
      409,
      `Cannot delete category with existing products (${count} products)`
    );
  }

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  return { message: "Category deleted" };
}

async function getProductsByCategory(id, options = {}) {
  const category = await getById(id);
  const result = await Product.findByCategory(id, options);

  return {
    category,
    ...result,
  };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteCategory,
  getProductsByCategory,
};
