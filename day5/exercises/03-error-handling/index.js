/**
 * Day 5 - Exercise 03: Mongoose Error Handling
 *
 * Mục tiêu:
 *   1. CastError -> 400
 *   2. ValidationError -> 400
 *   3. Duplicate key 11000 -> 409
 *   4. Not found -> 404
 *   5. Không expose Mongoose internals
 */

"use strict";

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// ============================================================
// Model
// ============================================================

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [2, "Name must be at least 2 characters"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\S+@\S+\.\S+$/,
      "Email is not valid",
    ],
  },

  age: {
    type: Number,
    min: [0, "Age cannot be negative"],
    max: [150, "Age is not realistic"],
  },

  role: {
    type: String,

    enum: {
      values: [
        "user",
        "admin",
        "moderator",
      ],

      message:
        '"{VALUE}" is not a valid role',
    },

    default: "user",
  },
});

const User = mongoose.model(
  "User",
  userSchema
);

// ============================================================
// GET /users
// ============================================================

app.get(
  "/users",
  async (req, res, next) => {
    try {
      const users =
        await User.find();

      res.json({
        success: true,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// GET /users/:id
// ============================================================

app.get(
  "/users/:id",
  async (req, res, next) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      // TODO 3.4
      if (!user) {
        const err =
          new Error(
            "User not found"
          );

        err.statusCode = 404;

        throw err;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// POST /users
// ============================================================

app.post(
  "/users",
  async (req, res, next) => {
    try {
      const user =
        await User.create(
          req.body
        );

      res
        .status(201)
        .json({
          success: true,
          data: user,
        });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// PUT /users/:id
// ============================================================

app.put(
  "/users/:id",
  async (req, res, next) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        const err =
          new Error(
            "User not found"
          );

        err.statusCode = 404;

        return next(err);
      }

      Object.assign(
        user,
        req.body
      );

      await user.save();

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// DELETE /users/:id
// ============================================================

app.delete(
  "/users/:id",
  async (req, res, next) => {
    try {
      const user =
        await User.findByIdAndDelete(
          req.params.id
        );

      if (!user) {
        const err =
          new Error(
            "User not found"
          );

        err.statusCode = 404;

        return next(err);
      }

      res.json({
        success: true,
        message:
          "User deleted",
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// TODO 3.1 - 3.5:
// Global Error Handler
// ============================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Error:",
      err.name,
      err.message
    );

    let statusCode =
      err.statusCode || 500;

    let message =
      "Internal Server Error";

    let details = null;

    // --------------------------------------------------------
    // TODO 3.1: CastError
    // --------------------------------------------------------

    if (
      err.name ===
        "CastError" &&
      err.kind ===
        "ObjectId"
    ) {
      statusCode = 400;

      message =
        `Invalid ID format: "${err.value}"`;
    }

    // --------------------------------------------------------
    // TODO 3.2: ValidationError
    // --------------------------------------------------------

    else if (
      err.name ===
      "ValidationError"
    ) {
      statusCode = 400;

      message =
        "Validation failed";

      details =
        Object.values(
          err.errors
        ).map(
          (error) => ({
            field:
              error.path,

            message:
              error.message,
          })
        );
    }

    // --------------------------------------------------------
    // TODO 3.3: Duplicate key
    // --------------------------------------------------------

    else if (
      err.code === 11000
    ) {
      statusCode = 409;

      const field =
        Object.keys(
          err.keyValue || {}
        )[0] ||
        "Field";

      message =
        `${field} already exists`;
    }

    // --------------------------------------------------------
    // Custom error
    // --------------------------------------------------------

    else if (
      err.statusCode
    ) {
      statusCode =
        err.statusCode;

      message =
        err.message;
    }

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    const response = {
      success: false,
      error: message,
    };

    if (details) {
      response.details =
        details;
    }

    if (
      process.env
        .NODE_ENV ===
      "development"
    ) {
      response.stack =
        err.stack;
    }

    res
      .status(statusCode)
      .json(response);
  }
);

// ============================================================
// Server startup
// ============================================================

const PORT =
  process.env.PORT ||
  3003;

async function startServer() {
  try {
    if (
      !process.env
        .MONGODB_URI
    ) {
      throw new Error(
        "MONGODB_URI is missing from .env"
      );
    }

    await mongoose.connect(
      process.env
        .MONGODB_URI
    );

    console.log(
      "MongoDB connected"
    );

    // Xóa dữ liệu cũ
    await User.deleteMany(
      {}
    );

    // Seed user để test duplicate
    await User.create({
      name:
        "Alice Smith",

      email:
        "alice@example.com",
    });

    console.log(
      'Seeded: user "alice@example.com" exists'
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on http://localhost:${PORT}`
        );

        console.log();

        console.log(
          "Test commands:"
        );

        console.log(
          `GET    /users`
        );

        console.log(
          `GET    /users/bad-id`
        );

        console.log(
          `GET    /users/507f1f77bcf86cd799439011`
        );

        console.log(
          `POST   /users`
        );

        console.log(
          `PUT    /users/:id`
        );

        console.log(
          `DELETE /users/:id`
        );
      }
    );
  } catch (err) {
    console.error(
      "Startup error:",
      err
    );

    process.exit(1);
  }
}

startServer();

// ============================================================
// CÂU HỎI TƯ DUY
// ============================================================

/**
 * Q1:
 * Tại sao không nên return nguyên err.message của
 * Mongoose ra client?
 *
 * Vì error message của Mongoose có thể chứa thông tin
 * nội bộ của schema, tên field, validation rules hoặc
 * implementation details.
 *
 * Việc expose trực tiếp có thể gây vấn đề bảo mật và
 * response không thân thiện với client.
 */

/**
 * Q2:
 *
 * Custom statusCode:
 * Dùng cho business/application error do mình chủ động tạo.
 *
 * Ví dụ:
 *
 * const err = new Error("User not found");
 * err.statusCode = 404;
 * throw err;
 *
 *
 * Mongoose error:
 * Do database/model tạo ra.
 *
 * Ví dụ:
 * User.findById("bad-id")
 * -> CastError
 *
 * User.create({ name: "A" })
 * -> ValidationError
 */

/**
 * Q3:
 *
 * Có thể bật validation cho findByIdAndUpdate:
 *
 * await User.findByIdAndUpdate(
 *   id,
 *   data,
 *   {
 *     runValidators: true,
 *     new: true
 *   }
 * );
 *
 * Nhưng đây không phải cách tốt nhất để update password
 * nếu password được hash bằng pre("save").
 *
 * Vì findByIdAndUpdate không chạy save middleware.
 *
 * Nên:
 *
 * const user = await User.findById(id);
 * user.password = newPassword;
 * await user.save();
 */

/**
 * Q4:
 *
 * Nếu ObjectId có format hợp lệ nhưng document không tồn tại,
 * Mongoose KHÔNG throw error.
 *
 * findById() trả về null.
 *
 * Vì vậy route/service phải tự kiểm tra:
 *
 * if (!user) {
 *   const err = new Error("User not found");
 *   err.statusCode = 404;
 *   throw err;
 * }
 */