/**
 * Auth Service
 * Business logic cho đăng ký và đăng nhập
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });

  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const { password: _password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

  const token = jwt.sign(
    {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  return { token, expiresIn };
}

module.exports = { register, login };
