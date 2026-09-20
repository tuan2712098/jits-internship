/**
 * Day 4 - Bài 1: Mongoose Basics
 */

const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const mongoose = require("mongoose");

// ============================================================
// SCHEMA DEFINITION
// ============================================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [
        8,
        "Password must be at least 8 characters",
      ],
      select: false,
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
          "{VALUE} is not a valid role",
      },
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    age: {
      type: Number,
      min: [
        0,
        "Age cannot be negative",
      ],
      max: [
        150,
        "Age seems unrealistic",
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User =
  mongoose.model("User", userSchema);

// ============================================================
// TODO 1.1 - Connect MongoDB
// ============================================================

async function connectDB() {
  mongoose.connection.on(
    "connected",
    () => {
      console.log(
        `MongoDB connected to: ${mongoose.connection.host}`
      );
    }
  );

  mongoose.connection.on(
    "error",
    err => {
      console.error(
        "MongoDB error:",
        err.message
      );
    }
  );

  mongoose.connection.on(
    "disconnected",
    () => {
      console.log(
        "MongoDB disconnected"
      );
    }
  );

  process.on(
    "SIGINT",
    async () => {
      await mongoose.connection.close();

      console.log(
        "MongoDB connection closed"
      );

      process.exit(0);
    }
  );

  await mongoose.connect(
    process.env.MONGO_URI
  );
}

// ============================================================
// TODO 1.2 - Create Users
// ============================================================

async function createUsers() {
  const usersData = [
    {
      name: "Alice",
      email: "alice@example.com",
      password: "Password123",
      role: "admin",
      age: 28,
    },
    {
      name: "Bob",
      email: "bob@example.com",
      password: "Password456",
      role: "user",
      age: 24,
    },
    {
      name: "Carol",
      email: "carol@example.com",
      password: "Password789",
      role: "user",
      age: 31,
    },
  ];

  const createdUsers = [];

  for (const data of usersData) {
    const user =
      await User.create(data);

    createdUsers.push(user);

    console.log(
      `Created user: ${user.name} (id: ${user._id})`
    );
  }

  return createdUsers;
}

// ============================================================
// TODO 1.3 - Get All Users
// ============================================================

async function getAllUsers() {
  const users =
    await User.find();

  console.log(
    `Total users: ${users.length}`
  );

  users.forEach(user => {
    console.log(
      `- ${user.name} (${user.email}) [${user.role}]`
    );
  });

  return users;
}

// ============================================================
// TODO 1.4 - Get User By Id
// ============================================================

async function getUserById(
  userId
) {
  const user =
    await User.findById(userId);

  if (!user) {
    console.log(
      `User not found: ${userId}`
    );

    return null;
  }

  console.log(
    `Found user: ${user.name} - created at ${user.createdAt}`
  );

  return user;
}

// ============================================================
// TODO 1.5 - Update User
// ============================================================

async function updateUser(
  userId,
  updateData
) {
  const before =
    await User.findById(userId);

  if (!before) {
    console.log(
      `User not found: ${userId}`
    );

    return null;
  }

  const oldName =
    before.name;

  const updated =
    await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

  if (
    updateData.name &&
    oldName !== updated.name
  ) {
    console.log(
      `Updated: ${oldName} -> ${updated.name}`
    );
  }

  return updated;
}

// ============================================================
// TODO 1.6 - Delete User
// ============================================================

async function deleteUser(
  userId
) {
  const deleted =
    await User.findByIdAndDelete(
      userId
    );

  if (!deleted) {
    throw new Error(
      "User not found"
    );
  }

  console.log(
    `Deleted user: ${deleted.name} (${deleted.email})`
  );

  const remaining =
    await User.countDocuments();

  console.log(
    `Remaining users: ${remaining}`
  );

  return deleted;
}

// ============================================================
// TODO 1.7 - Câu hỏi tư duy
// ============================================================

/**
 * Q1: ObjectId là gì? Tại sao MongoDB dùng ObjectId
 * thay vì integer auto-increment?
 *
 * A1:
 * ObjectId là id 12 byte do MongoDB tự tạo.
 * Nó có thể được sinh độc lập trên nhiều máy mà không cần
 * một bộ đếm trung tâm như integer auto-increment.
 *
 *
 * Q2: Mongoose validation khác Joi validation thế nào?
 *
 * A2:
 * Joi thường validate dữ liệu ở tầng request/API trước khi
 * dữ liệu đi vào business logic.
 *
 * Mongoose validation chạy ở tầng database/model nhằm bảo đảm
 * dữ liệu lưu vào MongoDB tuân theo schema.
 *
 * Thực tế có thể dùng cả hai.
 *
 *
 * Q3: select: false nghĩa là gì?
 *
 * A3:
 * Field đó không được trả về trong query mặc định.
 * Ví dụ password sẽ bị ẩn.
 *
 * Khi cần lấy password:
 * User.findOne({ email }).select("+password")
 *
 *
 * Q4: Vì sao dùng { new: true }?
 *
 * A4:
 * new: true làm findByIdAndUpdate trả về document sau khi update.
 * Nếu không có, Mongoose mặc định trả về document trước khi update.
 */

// ============================================================
// TEST RUNNER
// ============================================================

async function runTests() {
  console.log(
    "=".repeat(50)
  );

  console.log(
    "Day 4 - Exercise 01: Mongoose Basics"
  );

  console.log(
    "=".repeat(50)
  );

  await connectDB();

  // Xóa data cũ để lần chạy nào cũng giống nhau
  await User.deleteMany({});

  console.log(
    "Cleared existing users\n"
  );

  console.log(
    "--- TODO 1.2: Create Users ---"
  );

  const users =
    await createUsers();

  console.log();

  console.log(
    "--- TODO 1.3: Get All Users ---"
  );

  await getAllUsers();

  console.log();

  console.log(
    "--- TODO 1.4: Get User By Id ---"
  );

  const alice =
    users[0];

  await getUserById(
    alice._id
  );

  await getUserById(
    new mongoose.Types.ObjectId()
  );

  console.log();

  console.log(
    "--- TODO 1.5: Update User ---"
  );

  const updated =
    await updateUser(
      alice._id,
      {
        name: "Alice Smith",
        age: 29,
      }
    );

  console.log(
    "Updated user:",
    updated?.name,
    updated?.age
  );

  console.log();

  console.log(
    "--- TODO 1.6: Delete User ---"
  );

  const carol =
    users[2];

  await deleteUser(
    carol._id
  );

  console.log();

  console.log(
    "--- Final State ---"
  );

  await getAllUsers();

  console.log(
    "\nAll tests done. Closing connection..."
  );

  await mongoose.connection.close();
}

runTests().catch(err => {
  console.error(
    "Test failed:",
    err.message
  );

  process.exit(1);
});