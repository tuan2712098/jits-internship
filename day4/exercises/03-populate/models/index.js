require("dotenv").config();

const mongoose = require("mongoose");

const User =
  require("./user.model");

const Post =
  require("./post.model");

async function connectDB() {
  try {
    const conn =
      await mongoose.connect(
        process.env.MONGO_URI
      );

    console.log(
      `MongoDB connected: ${conn.connection.host}`
    );
  } catch (err) {
    console.error(
      "MongoDB connection error:",
      err.message
    );

    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.connection.close();

  console.log(
    "MongoDB disconnected"
  );
}

module.exports = {
  connectDB,
  disconnectDB,
  User,
  Post,
};