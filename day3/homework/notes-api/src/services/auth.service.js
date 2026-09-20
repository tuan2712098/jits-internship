const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const store =
  require("../data/store");

async function register({
  name,
  email,
  password,
}) {
  const existing =
    store.users.findByEmail(email);

  if (existing) {
    const err = new Error(
      "Email already registered"
    );

    err.statusCode = 409;

    throw err;
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  const user =
    store.users.create({
      name,
      email,
      hashedPassword,
    });

  const {
    password: ignoredPassword,
    ...safeUser
  } = user;

  return safeUser;
}

async function login({
  email,
  password,
}) {
  const user =
    store.users.findByEmail(email);

  if (!user) {
    const err = new Error(
      "Invalid email or password"
    );

    err.statusCode = 401;

    throw err;
  }

  const valid =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!valid) {
    const err = new Error(
      "Invalid email or password"
    );

    err.statusCode = 401;

    throw err;
  }

  const expiresIn =
    process.env.JWT_EXPIRES_IN ||
    "1h";

  const token =
    jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn,
      }
    );

  return {
    token,
    expiresIn,
  };
}

module.exports = {
  register,
  login,
};