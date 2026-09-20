/**
 * Day 5 - Exercise 01: Advanced Mongoose Schema
 *
 * Mục tiêu:
 * - pre("save") hook hash password
 * - instance method comparePassword()
 * - static method findByEmail()
 * - virtual fullName
 * - Mongoose validation
 */

"use strict";

const path = require("path");

// Load đúng file day5/.env
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ============================================================
// Schema Definition
// ============================================================

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email is not valid"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

// ============================================================
// 1.1: pre("save") hook
// ============================================================

userSchema.pre("save", async function () {
  // Nếu password không thay đổi thì không hash lại
  if (!this.isModified("password")) {
    return;
  }

  const saltRounds = 10;

  this.password = await bcrypt.hash(
    this.password,
    saltRounds
  );
});

// ============================================================
// 1.2: Instance method comparePassword()
// ============================================================

userSchema.methods.comparePassword = async function (
  plaintext
) {
  return bcrypt.compare(
    plaintext,
    this.password
  );
};

// ============================================================
// 1.3: Static method findByEmail()
// ============================================================

userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
  });
};

// ============================================================
// 1.4: Virtual fullName
// ============================================================

userSchema
  .virtual("fullName")
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

// ============================================================
// Model
// ============================================================

const User = mongoose.model(
  "User",
  userSchema
);

// ============================================================
// 1.5: Test cases
// ============================================================

async function runTests() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing from day5/.env"
    );
  }

  await mongoose.connect(
    process.env.MONGODB_URI
  );

  console.log(
    "MongoDB connected:",
    mongoose.connection.host
  );

  // Xóa dữ liệu cũ để test lại
  await User.deleteMany({});

  // ==========================================================
  // Test 1: Create User
  // ==========================================================

  console.log(
    "\n=== Test 1: Create User ==="
  );

  const user = await User.create({
    firstName: "Tuan",
    lastName: "Pham",
    email: "tuan@example.com",
    password: "password123",
  });

  console.log(
    "Stored password:",
    user.password
  );

  console.log(
    "Password is hashed:",
    user.password !== "password123"
  );

  console.log(
    "Full name:",
    user.fullName
  );

  console.log(
    "User JSON:",
    user.toJSON()
  );

  console.log(
    "Has __v:",
    user.toJSON().__v !== undefined
  );

  // ==========================================================
  // Test 2: comparePassword
  // ==========================================================

  console.log(
    "\n=== Test 2: comparePassword ==="
  );

  const correctPassword =
    await user.comparePassword(
      "password123"
    );

  const wrongPassword =
    await user.comparePassword(
      "wrongpassword"
    );

  console.log(
    "Correct password:",
    correctPassword
  );

  console.log(
    "Wrong password:",
    wrongPassword
  );

  // ==========================================================
  // Test 3: findByEmail
  // ==========================================================

  console.log(
    "\n=== Test 3: findByEmail ==="
  );

  const foundUser =
    await User.findByEmail(
      "tuan@example.com"
    );

  console.log(
    "Normal email:",
    foundUser
      ? foundUser.email
      : null
  );

  const uppercaseUser =
    await User.findByEmail(
      "TUAN@EXAMPLE.COM"
    );

  console.log(
    "Uppercase email:",
    uppercaseUser
      ? uppercaseUser.email
      : null
  );

  // ==========================================================
  // Test 4: Update Password
  // ==========================================================

  console.log(
    "\n=== Test 4: Update Password ==="
  );

  const userToUpdate =
    await User.findById(user._id);

  userToUpdate.password =
    "newpassword456";

  await userToUpdate.save();

  console.log(
    "New password works:",
    await userToUpdate.comparePassword(
      "newpassword456"
    )
  );

  console.log(
    "Old password works:",
    await userToUpdate.comparePassword(
      "password123"
    )
  );

  // ==========================================================
  // Test 5: Duplicate Email
  // ==========================================================

  console.log(
    "\n=== Test 5: Duplicate Email ==="
  );

  try {
    await User.create({
      firstName: "Another",
      lastName: "User",
      email: "tuan@example.com",
      password: "password999",
    });
  } catch (error) {
    console.log(
      "Duplicate error code:",
      error.code
    );

    console.log(
      "Expected code 11000:",
      error.code === 11000
    );
  }

  // ==========================================================
  // Finish
  // ==========================================================

  await mongoose.disconnect();

  console.log(
    "\nMongoDB disconnected"
  );
}

// ============================================================
// CÂU HỎI LÝ THUYẾT
// ============================================================

/**
 * Q1:
 *
 * Mongoose validation:
 * - Validation ở model/database layer.
 * - Đảm bảo dữ liệu lưu vào MongoDB đúng schema.
 *
 * Joi validation:
 * - Validation ở API/request layer.
 * - Kiểm tra dữ liệu client gửi lên trước khi vào database.
 *
 * Có thể sử dụng cả Joi và Mongoose validation.
 */

/**
 * Q2:
 *
 * Nếu User.create() gây validation error,
 * Promise sẽ reject.
 *
 * Xử lý:
 *
 * try {
 *   await User.create(...)
 * } catch (error) {
 *   next(error);
 * }
 */

/**
 * Q3:
 *
 * pre("save") chạy với:
 *
 * document.save()
 * Model.create()
 *
 * pre("save") không chạy với:
 *
 * findByIdAndUpdate()
 * findOneAndUpdate()
 * updateOne()
 * updateMany()
 *
 * Khi muốn đổi password:
 *
 * const user = await User.findById(id);
 * user.password = newPassword;
 * await user.save();
 */

// ============================================================
// Run
// ============================================================

runTests().catch(async error => {
  console.error(
    "Test failed:",
    error
  );

  try {
    await mongoose.disconnect();
  } catch {
    // bỏ qua lỗi disconnect
  }
});