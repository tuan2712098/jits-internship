/**
 * Bài tập 1 - Input Validation với Joi
 * Day 3 - Validation, Authentication & Project Structure
 */

const express = require("express");
const Joi = require("joi");

const app = express();
const PORT = 3001;

app.use(express.json());

// ============================================================
// Middleware validate
// ============================================================

function validate(schema, source = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    req[source] = value;
    next();
  };
}

// ============================================================
// 1.1 Product Validation
// ============================================================

const productSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  price: Joi.number()
    .positive()
    .required(),

  category: Joi.string()
    .valid("tech", "furniture", "clothing")
    .required(),

  inStock: Joi.boolean()
    .default(true),

  description: Joi.string()
    .trim()
    .max(500)
    .optional(),
});

app.post(
  "/api/products",
  validate(productSchema),
  (req, res) => {
    res.status(201).json({
      success: true,
      data: req.body,
    });
  }
);

// ============================================================
// 1.2 Query Validation
// ============================================================

const productQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  sort: Joi.string()
    .valid(
      "price_asc",
      "price_desc",
      "name_asc"
    )
    .optional(),
});

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 25000000,
    category: "tech",
    inStock: true,
  },
  {
    id: 2,
    name: "Phone",
    price: 15000000,
    category: "tech",
    inStock: false,
  },
  {
    id: 3,
    name: "Desk",
    price: 5000000,
    category: "furniture",
    inStock: true,
  },
  {
    id: 4,
    name: "Chair",
    price: 3000000,
    category: "furniture",
    inStock: true,
  },
  {
    id: 5,
    name: "Monitor",
    price: 8000000,
    category: "tech",
    inStock: true,
  },
];

app.get(
  "/api/products",
  validate(productQuerySchema, "query"),
  (req, res) => {
    const {
      page,
      limit,
      sort,
    } = req.query;

    let result = [...products];

    if (sort === "price_asc") {
      result.sort(
        (a, b) => a.price - b.price
      );
    }

    if (sort === "price_desc") {
      result.sort(
        (a, b) => b.price - a.price
      );
    }

    if (sort === "name_asc") {
      result.sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      );
    }

    const total = result.length;

    const totalPages =
      Math.ceil(total / limit);

    const startIndex =
      (page - 1) * limit;

    const endIndex =
      startIndex + limit;

    const paginatedProducts =
      result.slice(
        startIndex,
        endIndex
      );

    res.status(200).json({
      success: true,
      data: paginatedProducts,

      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
);

// ============================================================
// 1.3 Nested Validation - Orders
// ============================================================

const orderSchema = Joi.object({
  customerId: Joi.number()
    .integer()
    .required(),

  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number()
          .integer()
          .required(),

        quantity: Joi.number()
          .integer()
          .min(1)
          .max(99)
          .required(),
      })
    )
    .min(1)
    .required(),

  shippingAddress: Joi.object({
    street: Joi.string()
      .trim()
      .required(),

    city: Joi.string()
      .trim()
      .required(),

    district: Joi.string()
      .trim()
      .optional(),
  }).required(),

  note: Joi.string()
    .max(200)
    .optional(),
});

app.post(
  "/api/orders",
  validate(orderSchema),
  (req, res) => {
    const totalItems =
      req.body.items.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    const order = {
      orderId:
        Math.floor(
          Math.random() * 1000000
        ),

      ...req.body,

      totalItems,

      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: order,
    });
  }
);

// ============================================================
// 1.4 User Registration Validation
// ============================================================

const userRegistrationSchema =
  Joi.object({
    username: Joi.string()
      .min(3)
      .max(20)
      .pattern(
        /^[a-zA-Z0-9_]+$/
      )
      .required(),

    email: Joi.string()
      .email()
      .lowercase()
      .required(),

    password: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[A-Z])(?=.*\d).+$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter and one number",
      }),

    confirmPassword:
      Joi.string()
        .valid(
          Joi.ref("password")
        )
        .required()
        .messages({
          "any.only":
            "Passwords do not match",
        }),

    age: Joi.number()
      .integer()
      .min(13)
      .max(120)
      .optional(),
  });

app.post(
  "/api/register",
  validate(
    userRegistrationSchema
  ),
  (req, res) => {
    const {
      username,
      email,
      age,
    } = req.body;

    const user = {
      username,
      email,
    };

    if (age !== undefined) {
      user.age = age;
    }

    res.status(201).json({
      success: true,
      data: user,
    });
  }
);

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
  (err, req, res, next) => {
    console.error(
      "[ERROR]",
      err.message
    );

    res.status(
      err.statusCode || 500
    ).json({
      success: false,

      error:
        err.message ||
        "Internal Server Error",
    });
  }
);

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log(
    `Validation Exercise server running on http://localhost:${PORT}`
  );

  console.log("\nEndpoints:");

  console.log(
    "POST /api/products"
  );

  console.log(
    "GET  /api/products"
  );

  console.log(
    "POST /api/orders"
  );

  console.log(
    "POST /api/register"
  );
});