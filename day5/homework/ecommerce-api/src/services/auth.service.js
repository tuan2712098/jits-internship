/**
 * Auth Service
 */

"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

async function register(data) {
  const existingUser = await User.findByEmail(data.email);

  if (existingUser) {
    throw createHttpError(409, "Email already in use");
  }

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    role: data.role || "customer",
  });

  return {
    user: user.toSafeObject(),
    token: generateToken(user),
  };
}

async function login({ email, password }) {
  const user = await User.findByEmail(email);

  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw createHttpError(401, "Invalid credentials");
  }

  if (user.isActive === false) {
    throw createHttpError(403, "Account is deactivated");
  }

  return {
    user: user.toSafeObject(),
    token: generateToken(user),
  };
}

async function getMe(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user.toSafeObject();
}

module.exports = { register, login, getMe };
