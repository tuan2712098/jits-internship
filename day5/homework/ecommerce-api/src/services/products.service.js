/**
 * Products Service
 */

"use strict";

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getProducts(filters = {}, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};

    if (filters.minPrice !== undefined) {
      query.price.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  if (filters.search) {
    query.name = {
      $regex: filters.search,
      $options: "i",
    };
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
  };

  const sortOption = sortMap[options.sort] || { createdAt: -1 };

  // avgRating là virtual nên sort rating cần xử lý sau khi lấy dữ liệu.
  if (options.sort === "rating") {
    const all = await Product.find(query).populate("category", "name slug");
    all.sort((a, b) => b.avgRating - a.avgRating);

    const data = all.slice(skip, skip + limit);
    const total = all.length;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  const [data, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getById(id) {
  const product = await Product.findById(id).populate(
    "category",
    "name slug description"
  );

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  return product;
}

async function create(data) {
  const category = await Category.findById(data.category);

  if (!category) {
    throw createHttpError(400, "Category not found");
  }

  const product = await Product.create(data);
  await product.populate("category", "name slug");

  return product;
}

async function update(id, data) {
  const product = await Product.findById(id);

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  if (data.category) {
    const category = await Category.findById(data.category);

    if (!category) {
      throw createHttpError(400, "Category not found");
    }
  }

  Object.assign(product, data);
  await product.save();
  await product.populate("category", "name slug");

  return product;
}

async function softDelete(id) {
  const product = await Product.findById(id);

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  product.isActive = false;
  await product.save();

  return { message: "Product deleted" };
}

async function addRating(id, userId, ratingData) {
  const product = await Product.findOne({ _id: id, isActive: true });

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  const existingIndex = product.ratings.findIndex(
    (rating) => rating.user.toString() === userId.toString()
  );

  if (existingIndex >= 0) {
    product.ratings[existingIndex].score = ratingData.score;
    product.ratings[existingIndex].review = ratingData.review;
  } else {
    product.ratings.push({
      user: userId,
      score: ratingData.score,
      review: ratingData.review,
    });
  }

  await product.save();

  return product;
}

async function getStats(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const castError = new mongoose.Error.CastError("ObjectId", id, "_id");
    throw castError;
  }

  const [result] = await Product.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
        isActive: true,
      },
    },
    {
      $project: {
        name: 1,
        scores: "$ratings.score",
        totalRatings: { $size: "$ratings" },
        avgRating: {
          $cond: [
            { $gt: [{ $size: "$ratings" }, 0] },
            { $round: [{ $avg: "$ratings.score" }, 1] },
            0,
          ],
        },
      },
    },
  ]);

  if (!result) {
    throw createHttpError(404, "Product not found");
  }

  const ratingDistribution = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  for (const score of result.scores || []) {
    const key = String(score);
    if (ratingDistribution[key] !== undefined) {
      ratingDistribution[key] += 1;
    }
  }

  return {
    productId: result._id,
    name: result.name,
    totalRatings: result.totalRatings,
    avgRating: result.avgRating,
    ratingDistribution,
  };
}

module.exports = {
  getProducts,
  getById,
  create,
  update,
  softDelete,
  addRating,
  getStats,
};
