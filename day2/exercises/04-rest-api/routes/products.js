/**
 * Products Router
 * Day 2 - Exercise 04
 *
 * Implement đầy đủ CRUD cho Products resource
 */

const express = require("express");
const router = express.Router();

const db = require("../data/products");
const { validateBody } = require("../middleware");

// ============================================================
// Validation Schemas
// ============================================================

const createProductSchema = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 200,
  },

  price: {
    required: true,
    type: "number",
    min: 0,
  },

  category: {
    required: false,
    type: "string",
    maxLength: 50,
  },

  description: {
    required: false,
    type: "string",
    maxLength: 1000,
  },

  inStock: {
    required: false,
    type: "boolean",
  },

  quantity: {
    required: false,
    type: "number",
    min: 0,
  },
};

const replaceProductSchema = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 200,
  },

  price: {
    required: true,
    type: "number",
    min: 0,
  },

  category: {
    required: true,
    type: "string",
    maxLength: 50,
  },

  description: {
    required: false,
    type: "string",
    maxLength: 1000,
  },

  inStock: {
    required: true,
    type: "boolean",
  },

  quantity: {
    required: true,
    type: "number",
    min: 0,
  },
};

const patchProductSchema = {
  name: {
    required: false,
    type: "string",
    minLength: 2,
    maxLength: 200,
  },

  price: {
    required: false,
    type: "number",
    min: 0,
  },

  category: {
    required: false,
    type: "string",
    maxLength: 50,
  },

  description: {
    required: false,
    type: "string",
    maxLength: 1000,
  },

  inStock: {
    required: false,
    type: "boolean",
  },

  quantity: {
    required: false,
    type: "number",
    min: 0,
  },
};

// ============================================================
// GET /api/products
// ============================================================

router.get("/", (req, res) => {
  const {
    category,
    inStock,
    minPrice,
    maxPrice,
    search,
    sort,
    order,
  } = req.query;

  const options = {
    category,
    inStock,
    minPrice,
    maxPrice,
    search,
    sort,
    order,
  };

  const products = db.getAll(options);

  res.status(200).json({
    success: true,
    data: products,
    total: products.length,

    filters: {
      category,
      inStock,
      minPrice,
      maxPrice,
      search,
      sort,
      order,
    },
  });
});

// ============================================================
// GET /api/products/stats
// ============================================================

// Phải đặt trước /:id
router.get("/stats", (req, res) => {
  const stats = db.getStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// ============================================================
// GET /api/products/categories
// ============================================================

router.get("/categories", (req, res) => {
  const categories = db.getCategories();

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// ============================================================
// GET /api/products/:id
// ============================================================

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid product ID",
    });
  }

  const product = db.getById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// ============================================================
// POST /api/products
// ============================================================

router.post(
  "/",
  validateBody(createProductSchema),
  (req, res) => {
    // Business rule:
    // Không thể hết hàng nhưng quantity > 0
    if (
      req.body.inStock === false &&
      req.body.quantity > 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Product cannot have quantity greater than 0 when inStock is false",
      });
    }

    // Nếu inStock=true nhưng quantity=0
    // thì tự chuyển thành hết hàng
    if (
      req.body.inStock === true &&
      req.body.quantity === 0
    ) {
      req.body.inStock = false;
    }

    const product = db.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  }
);

// ============================================================
// PUT /api/products/:id
// ============================================================

router.put(
  "/:id",
  validateBody(replaceProductSchema),
  (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    const product = db.replace(
      id,
      req.body
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);

// ============================================================
// PATCH /api/products/:id
// ============================================================

router.patch(
  "/:id",
  validateBody(patchProductSchema),
  (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "At least one field required for update",
      });
    }

    const product = db.update(
      id,
      req.body
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);

// ============================================================
// DELETE /api/products/:id
// ============================================================

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid product ID",
    });
  }

  const deleted = db.remove(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

module.exports = router;