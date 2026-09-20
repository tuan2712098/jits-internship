/**
 * Bài tập 2 - JWT Authentication
 * Day 3 - Validation, Authentication & Project Structure
 */

const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = process.env.PORT || 3002;
const JWT_SECRET =
  process.env.JWT_SECRET || "day3-super-secret-key";

const JWT_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN || "1h";

app.use(express.json());

// ============================================================
// In-memory data store
// ============================================================

let users = [];
let nextUserId = 1;

// ============================================================
// Seed admin
// ============================================================

async function seedAdmin() {
  const hashedPassword =
    await bcrypt.hash("Admin@123", 10);

  users.push({
    id: nextUserId++,
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
    createdAt: new Date(),
  });

  console.log(
    "Admin seeded: admin@example.com / Admin@123"
  );
}

// ============================================================
// Joi Schemas
// ============================================================

const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required(),

  email: Joi.string()
    .email()
    .lowercase()
    .required(),

  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 1 uppercase, 1 lowercase, and 1 number",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required(),

  password: Joi.string()
    .required(),
});

const updateProfileSchema =
  Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .trim(),
  }).min(1);

// ============================================================
// Validation Middleware
// ============================================================

function validate(
  schema,
  source = "body"
) {
  return (req, res, next) => {
    const {
      error,
      value,
    } = schema.validate(
      req[source],
      {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      }
    );

    if (error) {
      const errors =
        error.details.map(
          detail => ({
            field:
              detail.path.join("."),
            message:
              detail.message,
          })
        );

      return res
        .status(400)
        .json({
          success: false,
          error:
            "Validation failed",
          details: errors,
        });
    }

    req[source] = value;

    next();
  };
}

// ============================================================
// Authenticate Middleware
// ============================================================

function authenticate(
  req,
  res,
  next
) {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith(
      "Bearer "
    )
  ) {
    return res
      .status(401)
      .json({
        success: false,
        error:
          "Authentication token required.",
      });
  }

  const token =
    authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        error:
          "Authentication token required.",
      });
  }

  try {
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    req.user = decoded;

    next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({
          success: false,
          error:
            "Token expired. Please login again.",
        });
    }

    return res
      .status(401)
      .json({
        success: false,
        error:
          "Invalid token.",
      });
  }
}

// ============================================================
// Authorize Middleware
// ============================================================

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          error:
            "Authentication required.",
        });
    }

    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,
          error:
            "You do not have permission to access this resource.",
        });
    }

    next();
  };
}

// ============================================================
// POST /api/auth/register
// ============================================================

app.post(
  "/api/auth/register",

  validate(registerSchema),

  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      const existingUser =
        users.find(
          user =>
            user.email === email
        );

      if (existingUser) {
        return res
          .status(409)
          .json({
            success: false,
            error:
              "Email already registered",
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user = {
        id: nextUserId++,
        name,
        email,
        password:
          hashedPassword,
        role: "user",
        createdAt:
          new Date(),
      };

      users.push(user);

      const {
        password:
          ignoredPassword,
        ...userWithoutPassword
      } = user;

      res
        .status(201)
        .json({
          success: true,
          data:
            userWithoutPassword,
        });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// POST /api/auth/login
// ============================================================

app.post(
  "/api/auth/login",

  validate(loginSchema),

  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const user =
        users.find(
          user =>
            user.email === email
        );

      if (!user) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Invalid email or password",
          });
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatches) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Invalid email or password",
          });
      }

      const token =
        jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
          },

          JWT_SECRET,

          {
            expiresIn:
              JWT_EXPIRES_IN,
          }
        );

      res.status(200).json({
        success: true,

        data: {
          token,
          expiresIn:
            JWT_EXPIRES_IN,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/users/me
// ============================================================

app.get(
  "/api/users/me",

  authenticate,

  async (
    req,
    res,
    next
  ) => {
    try {
      const user =
        users.find(
          user =>
            user.id ===
            req.user.userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "User not found",
          });
      }

      const {
        password:
          ignoredPassword,
        ...userWithoutPassword
      } = user;

      res.status(200).json({
        success: true,
        data:
          userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// PUT /api/users/me
// ============================================================

app.put(
  "/api/users/me",

  authenticate,

  validate(
    updateProfileSchema
  ),

  async (
    req,
    res,
    next
  ) => {
    try {
      const index =
        users.findIndex(
          user =>
            user.id ===
            req.user.userId
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "User not found",
          });
      }

      if (
        req.body.name !==
        undefined
      ) {
        users[index].name =
          req.body.name;
      }

      users[index].updatedAt =
        new Date();

      const {
        password:
          ignoredPassword,
        ...userWithoutPassword
      } = users[index];

      res.status(200).json({
        success: true,
        data:
          userWithoutPassword,
        message:
          "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET /api/admin/users
// ============================================================

app.get(
  "/api/admin/users",

  authenticate,

  authorize("admin"),

  (req, res) => {
    const safeUsers =
      users.map(user => {
        const {
          password:
            ignoredPassword,
          ...userWithoutPassword
        } = user;

        return userWithoutPassword;
      });

    res.status(200).json({
      success: true,
      data: safeUsers,
      totalUsers:
        safeUsers.length,
    });
  }
);

// ============================================================
// DELETE /api/admin/users/:id
// ============================================================

app.delete(
  "/api/admin/users/:id",

  authenticate,

  authorize("admin"),

  (req, res) => {
    const id =
      parseInt(
        req.params.id,
        10
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid user ID",
        });
    }

    if (
      id ===
      req.user.userId
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Cannot delete yourself",
        });
    }

    const index =
      users.findIndex(
        user =>
          user.id === id
      );

    if (index === -1) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "User not found",
        });
    }

    users.splice(
      index,
      1
    );

    res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
    });
  }
);

// ============================================================
// Bonus answers
// ============================================================

/**
 * Q1:
 * Vì sao email không tồn tại và password sai đều trả
 * "Invalid email or password"?
 *
 * A1:
 * Tránh tiết lộ email nào đã đăng ký trong hệ thống.
 *
 * Q2:
 * JWT payload có thể decode bởi bất kỳ ai không?
 *
 * A2:
 * Có. JWT payload không được mã hóa, chỉ được ký.
 * Không nên lưu password hoặc dữ liệu bí mật trong payload.
 * Chỉ nên lưu userId, email, role và các thông tin cần thiết.
 *
 * Q3:
 * User đổi password thì token cũ có còn hợp lệ không?
 *
 * A3:
 * Với implementation hiện tại thì token cũ vẫn hợp lệ
 * cho đến khi hết hạn.
 * Có thể xử lý bằng tokenVersion, blacklist,
 * đổi signing secret hoặc session store.
 *
 * Q4:
 * Vì sao token cần expiry?
 *
 * A4:
 * Giới hạn thời gian token bị lộ có thể được sử dụng.
 * 1 giờ là một lựa chọn phổ biến nhưng thời gian phù hợp
 * phụ thuộc vào yêu cầu bảo mật của hệ thống.
 *
 * Q5:
 * 401 và 403 khác nhau?
 *
 * A5:
 * 401: chưa đăng nhập hoặc token không hợp lệ.
 * 403: đã đăng nhập nhưng không có đủ quyền.
 *
 * Ví dụ:
 * - Không có token gọi /api/users/me -> 401.
 * - User thường gọi /api/admin/users -> 403.
 */

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:
      `Cannot ${req.method} ${req.path}`,
  });
});

// ============================================================
// Error Handler
// ============================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "[ERROR]",
      err.message
    );

    if (
      err.type ===
      "entity.parse.failed"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid JSON in request body",
        });
    }

    res
      .status(
        err.statusCode ||
          500
      )
      .json({
        success: false,

        error:
          err.message ||
          "Internal Server Error",

        ...(process.env
          .NODE_ENV ===
          "development" && {
          stack:
            err.stack,
        }),
      });
  }
);

// ============================================================
// Start Server
// ============================================================

seedAdmin()
  .then(() => {
    app.listen(
      PORT,
      () => {
        console.log(
          `\nAuth Exercise server running on http://localhost:${PORT}`
        );

        console.log(
          "\nAdmin account:"
        );

        console.log(
          "Email: admin@example.com"
        );

        console.log(
          "Password: Admin@123"
        );

        console.log(
          "\nEndpoints:"
        );

        console.log(
          "POST   /api/auth/register"
        );

        console.log(
          "POST   /api/auth/login"
        );

        console.log(
          "GET    /api/users/me"
        );

        console.log(
          "PUT    /api/users/me"
        );

        console.log(
          "GET    /api/admin/users"
        );

        console.log(
          "DELETE /api/admin/users/:id"
        );
      }
    );
  })
  .catch(error => {
    console.error(
      "Failed to start server:",
      error
    );
  });