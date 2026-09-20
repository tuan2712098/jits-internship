/**
 * Bài tập 3 - Middleware
 * Day 2 - Express.js & REST API
 */

const express = require("express");

const app = express();
const PORT = 3003;

app.use(express.json());

// ============================================================
// 3.1: Middleware Order
// ============================================================

/**
 * Q1:
 * Middleware A gọi next(), Middleware B không gọi next().
 * Route handler có chạy không?
 *
 * A1:
 * Không, nếu Middleware B đứng trước route và không gọi next()
 * hoặc không gửi response thì request sẽ bị treo.
 *
 * Q2:
 * Middleware gọi res.json() mà không gọi next(),
 * middleware phía sau có chạy không?
 *
 * A2:
 * Không.
 *
 * Q3:
 * Kích hoạt error middleware như thế nào?
 *
 * A3:
 * Gọi next(error).
 *
 * Q4:
 * Middleware khai báo sau app.use("/api", router)
 * có chạy cho route /api/users không?
 *
 * A4:
 * Chỉ chạy nếu route/router phía trước gọi next().
 *
 * Q5:
 * Global middleware đặt sau route có áp dụng cho route đó không?
 *
 * A5:
 * Không áp dụng trước route đó.
 * Express chạy middleware theo đúng thứ tự khai báo.
 */

// ============================================================
// 3.2: Logger Middleware
// ============================================================

function requestLogger(req, res, next) {
  const start = Date.now();

  const requestId =
    `req_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;

  req.id = requestId;

  res.set("X-Request-ID", requestId);

  console.log(
    `[${new Date().toISOString()}] --> ${req.method} ${req.path}`
  );

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `[${new Date().toISOString()}] <-- ` +
      `${req.method} ${req.path} ` +
      `${res.statusCode} ${duration}ms`
    );
  });

  next();
}

// ============================================================
// 3.3: Authentication Middleware
// ============================================================

const validTokens = {
  "token-alice-123": {
    id: 1,
    name: "Alice",
    role: "admin",
  },

  "token-bob-456": {
    id: 2,
    name: "Bob",
    role: "user",
  },

  "token-charlie-789": {
    id: 3,
    name: "Charlie",
    role: "user",
  },
};

function authenticate(req, res, next) {
  const authHeader = req.get("Authorization");

  // Không có token
  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  // Sai format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Invalid token format",
    });
  }

  // Lấy token
  const token = authHeader.slice(7);

  const user = validTokens[token];

  // Token sai
  if (!user) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }

  // Token đúng
  req.user = user;

  next();
}

// ============================================================
// 3.4: Authorization Middleware
// ============================================================

function authorize(roles) {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    next();
  };
}

// ============================================================
// 3.5: Validation Middleware
// ============================================================

function validateBody(schema) {
  return (req, res, next) => {

    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {

      const value = req.body[field];

      // Required
      if (
        rules.required &&
        (
          value === undefined ||
          value === null ||
          value === ""
        )
      ) {
        errors.push(`${field} is required`);
        continue;
      }

      // Không bắt buộc và không gửi
      if (
        value === undefined ||
        value === null
      ) {
        continue;
      }

      // Type
      if (
        rules.type &&
        typeof value !== rules.type
      ) {
        errors.push(
          `${field} must be a ${rules.type}`
        );

        continue;
      }

      // String validation
      if (rules.type === "string") {

        if (
          rules.minLength !== undefined &&
          value.length < rules.minLength
        ) {
          errors.push(
            `${field} must be at least ${rules.minLength} characters`
          );
        }

        if (
          rules.maxLength !== undefined &&
          value.length > rules.maxLength
        ) {
          errors.push(
            `${field} must be at most ${rules.maxLength} characters`
          );
        }
      }

      // Number validation
      if (rules.type === "number") {

        if (
          rules.min !== undefined &&
          value < rules.min
        ) {
          errors.push(
            `${field} must be at least ${rules.min}`
          );
        }

        if (
          rules.max !== undefined &&
          value > rules.max
        ) {
          errors.push(
            `${field} must be at most ${rules.max}`
          );
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    next();
  };
}

// ============================================================
// 3.6: Rate Limiter
// ============================================================

function rateLimiter({
  windowMs = 60000,
  max = 10,
} = {}) {

  const clients = new Map();

  return (req, res, next) => {

    const ip =
      req.ip ||
      req.socket.remoteAddress;

    const now = Date.now();

    let record = clients.get(ip);

    // Chưa có hoặc hết thời gian
    if (
      !record ||
      now >= record.resetTime
    ) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    record.count++;

    clients.set(ip, record);

    res.set(
      "X-RateLimit-Limit",
      String(max)
    );

    res.set(
      "X-RateLimit-Remaining",
      String(
        Math.max(
          0,
          max - record.count
        )
      )
    );

    res.set(
      "X-RateLimit-Reset",
      new Date(
        record.resetTime
      ).toISOString()
    );

    // Quá giới hạn
    if (record.count > max) {
      return res.status(429).json({
        error: "Too Many Requests",
      });
    }

    next();
  };
}

// ============================================================
// 3.7: Error Handling
// ============================================================

class AppError extends Error {

  constructor(
    message,
    statusCode = 500,
    code = "INTERNAL_ERROR"
  ) {

    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

class NotFoundError extends AppError {

  constructor(resource = "Resource") {

    super(
      `${resource} not found`,
      404,
      "NOT_FOUND"
    );
  }
}

class ValidationError extends AppError {

  constructor(message) {

    super(
      message,
      400,
      "VALIDATION_ERROR"
    );
  }
}

class UnauthorizedError extends AppError {

  constructor(
    message = "Unauthorized"
  ) {

    super(
      message,
      401,
      "UNAUTHORIZED"
    );
  }
}

// Error Middleware
function errorHandler(
  err,
  req,
  res,
  next
) {

  console.error(
    `[ERROR] ${err.message}`
  );

  console.error(err.stack);

  // JSON sai
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
        code: "INVALID_JSON",
      });
  }

  // Custom AppError
  if (err instanceof AppError) {

    return res
      .status(err.statusCode)
      .json({
        success: false,
        error: err.message,
        code: err.code,

        ...(process.env.NODE_ENV ===
          "development" && {
          stack: err.stack,
        }),
      });
  }

  // Lỗi khác
  res.status(500).json({
    success: false,
    error:
      err.message ||
      "Internal Server Error",

    code: "INTERNAL_ERROR",

    ...(process.env.NODE_ENV ===
      "development" && {
      stack: err.stack,
    }),
  });
}

// ============================================================
// 3.8: Routes Test
// ============================================================

// Global logger
app.use(requestLogger);

// ----------------------------
// Public
// ----------------------------

app.get(
  "/public",
  (req, res) => {

    res.json({
      message:
        "Public endpoint - no auth needed",
    });
  }
);

// ----------------------------
// Rate Limit
// ----------------------------

app.get(
  "/limited",

  rateLimiter({
    windowMs: 10000,
    max: 3,
  }),

  (req, res) => {

    res.json({
      message:
        "You passed the rate limit!",

      requestId: req.id,
    });
  }
);

// ----------------------------
// Protected
// ----------------------------

app.get(
  "/protected",

  authenticate,

  (req, res) => {

    res.json({
      message:
        `Hello, ${req.user.name}!`,

      user: req.user,
    });
  }
);

// ----------------------------
// Admin Only
// ----------------------------

app.get(
  "/admin-only",

  authenticate,

  authorize(["admin"]),

  (req, res) => {

    res.json({
      message: "Admin area",
      user: req.user,
    });
  }
);

// ============================================================
// Product validation
// ============================================================

const productSchema = {

  name: {
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 100,
  },

  price: {
    required: true,
    type: "number",
    min: 0,
  },

  category: {
    required: false,
    type: "string",
  },

  inStock: {
    required: false,
    type: "boolean",
  },
};

app.post(
  "/products",

  authenticate,

  validateBody(productSchema),

  (req, res) => {

    res.status(201).json({

      message:
        "Product created (mock)",

      product: {
        id:
          Math.floor(
            Math.random() * 1000
          ),

        ...req.body,
      },
    });
  }
);

// ============================================================
// Error test routes
// ============================================================

app.get(
  "/throw/:type",

  (req, res, next) => {

    const {
      type,
    } = req.params;

    switch (type) {

      case "notfound":

        return next(
          new NotFoundError(
            "Product"
          )
        );

      case "validation":

        return next(
          new ValidationError(
            "Name cannot be empty"
          )
        );

      case "unauthorized":

        return next(
          new UnauthorizedError()
        );

      case "generic":

        return next(
          new Error(
            "Unexpected error occurred"
          )
        );

      case "sync":

        throw new Error(
          "Synchronous error"
        );

      default:

        return res.json({
          message:
            "No error thrown",
        });
    }
  }
);

// Async error
app.get(
  "/async-error",

  async (req, res, next) => {

    try {

      await new Promise(
        (_, reject) => {

          setTimeout(
            () =>
              reject(
                new Error(
                  "Database connection failed"
                )
              ),

            100
          );
        }
      );

    } catch (error) {

      next(error);
    }
  }
);

// ============================================================
// 404
// ============================================================

app.use(
  (req, res, next) => {

    next(
      new NotFoundError(
        `Route ${req.method} ${req.path}`
      )
    );
  }
);

// ============================================================
// Error middleware PHẢI cuối cùng
// ============================================================

app.use(errorHandler);

// ============================================================
// Start server
// ============================================================

app.listen(
  PORT,

  () => {

    console.log(
      `Middleware server running on http://localhost:${PORT}`
    );

    console.log("\nTest middleware:");

    console.log(
      `GET /public`
    );

    console.log(
      `GET /limited`
    );

    console.log(
      `GET /protected`
    );

    console.log(
      `GET /admin-only`
    );

    console.log(
      `POST /products`
    );

    console.log(
      `GET /throw/notfound`
    );

    console.log(
      `GET /async-error`
    );
  }
);