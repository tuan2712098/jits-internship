/**
 * Homework - TODO REST API
 * Day 2
 *
 * Nâng cấp TODO App Day 1 thành REST API với Express.js
 */

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// ============================================================
// Data Store
// ============================================================

let todos = [];
let nextId = 1;

const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_FILTERS = ["all", "active", "completed"];
const VALID_SORTS = ["createdAt", "priority", "title"];
const VALID_ORDERS = ["asc", "desc"];

// ============================================================
// Response helpers
// ============================================================

function successResponse(
  res,
  data,
  statusCode = 200,
  message = null
) {
  const body = {
    success: true,
    data,
  };

  if (message) {
    body.message = message;
  }

  return res.status(statusCode).json(body);
}

function errorResponse(
  res,
  message,
  statusCode = 400,
  code = "ERROR"
) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code,
  });
}

// ============================================================
// Request Logger
// ============================================================

function requestLogger(req, res, next) {
  const start = Date.now();

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

app.use(requestLogger);

// ============================================================
// Helper
// ============================================================

function parseTodoId(id) {
  const number = Number(id);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

// ============================================================
// GET /api/todos
// ============================================================

app.get("/api/todos", (req, res) => {
  const {
    filter = "all",
    priority,
    search,
    sort = "createdAt",
    order = "asc",
  } = req.query;

  // Validate filter
  if (!VALID_FILTERS.includes(filter)) {
    return errorResponse(
      res,
      "Invalid filter value",
      400,
      "INVALID_FILTER"
    );
  }

  // Validate priority
  if (
    priority &&
    !VALID_PRIORITIES.includes(priority)
  ) {
    return errorResponse(
      res,
      "Invalid priority value",
      400,
      "INVALID_PRIORITY"
    );
  }

  // Validate sort
  if (!VALID_SORTS.includes(sort)) {
    return errorResponse(
      res,
      "Invalid sort value",
      400,
      "INVALID_SORT"
    );
  }

  // Validate order
  if (!VALID_ORDERS.includes(order)) {
    return errorResponse(
      res,
      "Invalid order value",
      400,
      "INVALID_ORDER"
    );
  }

  let result = [...todos];

  // Filter completed / active
  if (filter === "active") {
    result = result.filter(
      todo => !todo.completed
    );
  }

  if (filter === "completed") {
    result = result.filter(
      todo => todo.completed
    );
  }

  // Filter priority
  if (priority) {
    result = result.filter(
      todo => todo.priority === priority
    );
  }

  // Search title
  if (search) {
    const keyword =
      search.toLowerCase().trim();

    result = result.filter(todo =>
      todo.title
        .toLowerCase()
        .includes(keyword)
    );
  }

  // Sort
  const priorityOrder = {
    low: 1,
    medium: 2,
    high: 3,
  };

  result.sort((a, b) => {
    let comparison = 0;

    if (sort === "title") {
      comparison =
        a.title.localeCompare(b.title);
    }

    if (sort === "priority") {
      comparison =
        priorityOrder[a.priority] -
        priorityOrder[b.priority];
    }

    if (sort === "createdAt") {
      comparison =
        new Date(a.createdAt) -
        new Date(b.createdAt);
    }

    return order === "desc"
      ? -comparison
      : comparison;
  });

  return res.status(200).json({
    success: true,
    data: result,
    total: result.length,

    filters: {
      filter,
      priority: priority || null,
      search: search || null,
      sort,
      order,
    },
  });
});

// ============================================================
// POST /api/todos
// ============================================================

app.post("/api/todos", (req, res) => {
  const {
    title,
    priority = "medium",
  } = req.body;

  // Title bắt buộc
  if (title === undefined) {
    return errorResponse(
      res,
      "Title is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (typeof title !== "string") {
    return errorResponse(
      res,
      "Title must be a string",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (title.trim() === "") {
    return errorResponse(
      res,
      "Title cannot be empty",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (title.trim().length > 200) {
    return errorResponse(
      res,
      "Title must not exceed 200 characters",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (
    !VALID_PRIORITIES.includes(priority)
  ) {
    return errorResponse(
      res,
      "Invalid priority value",
      400,
      "VALIDATION_ERROR"
    );
  }

  const todo = {
    id: nextId++,
    title: title.trim(),
    priority,
    completed: false,
    createdAt: new Date(),
  };

  todos.push(todo);

  return successResponse(
    res,
    todo,
    201,
    "Todo created successfully"
  );
});

// ============================================================
// GET /api/todos/:id
// ============================================================

app.get("/api/todos/:id", (req, res) => {
  const id = parseTodoId(
    req.params.id
  );

  if (!id) {
    return errorResponse(
      res,
      "Invalid todo ID",
      400,
      "INVALID_ID"
    );
  }

  const todo = todos.find(
    todo => todo.id === id
  );

  if (!todo) {
    return errorResponse(
      res,
      "Todo not found",
      404,
      "NOT_FOUND"
    );
  }

  return successResponse(
    res,
    todo
  );
});

// ============================================================
// PATCH /api/todos/:id
// ============================================================

app.patch("/api/todos/:id", (req, res) => {
  const id = parseTodoId(
    req.params.id
  );

  if (!id) {
    return errorResponse(
      res,
      "Invalid todo ID",
      400,
      "INVALID_ID"
    );
  }

  if (
    !req.body ||
    Object.keys(req.body).length === 0
  ) {
    return errorResponse(
      res,
      "Request body cannot be empty",
      400,
      "VALIDATION_ERROR"
    );
  }

  const allowedFields = [
    "title",
    "priority",
    "completed",
  ];

  const invalidFields =
    Object.keys(req.body).filter(
      field =>
        !allowedFields.includes(field)
    );

  if (invalidFields.length > 0) {
    return errorResponse(
      res,
      `Cannot update fields: ${invalidFields.join(", ")}`,
      400,
      "VALIDATION_ERROR"
    );
  }

  // Validate title
  if (
    Object.prototype.hasOwnProperty.call(
      req.body,
      "title"
    )
  ) {
    if (
      typeof req.body.title !== "string"
    ) {
      return errorResponse(
        res,
        "Title must be a string",
        400,
        "VALIDATION_ERROR"
      );
    }

    if (
      req.body.title.trim() === ""
    ) {
      return errorResponse(
        res,
        "Title cannot be empty",
        400,
        "VALIDATION_ERROR"
      );
    }

    if (
      req.body.title.trim().length >
      200
    ) {
      return errorResponse(
        res,
        "Title must not exceed 200 characters",
        400,
        "VALIDATION_ERROR"
      );
    }
  }

  // Validate priority
  if (
    Object.prototype.hasOwnProperty.call(
      req.body,
      "priority"
    ) &&
    !VALID_PRIORITIES.includes(
      req.body.priority
    )
  ) {
    return errorResponse(
      res,
      "Invalid priority value",
      400,
      "VALIDATION_ERROR"
    );
  }

  // Validate completed
  if (
    Object.prototype.hasOwnProperty.call(
      req.body,
      "completed"
    ) &&
    typeof req.body.completed !==
      "boolean"
  ) {
    return errorResponse(
      res,
      "Completed must be a boolean",
      400,
      "VALIDATION_ERROR"
    );
  }

  const todo = todos.find(
    todo => todo.id === id
  );

  if (!todo) {
    return errorResponse(
      res,
      "Todo not found",
      404,
      "NOT_FOUND"
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      req.body,
      "title"
    )
  ) {
    todo.title =
      req.body.title.trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(
      req.body,
      "priority"
    )
  ) {
    todo.priority =
      req.body.priority;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      req.body,
      "completed"
    )
  ) {
    todo.completed =
      req.body.completed;
  }

  todo.updatedAt = new Date();

  return successResponse(
    res,
    todo,
    200,
    "Todo updated"
  );
});

// ============================================================
// PATCH /api/todos/:id/complete
// ============================================================

app.patch(
  "/api/todos/:id/complete",
  (req, res) => {
    const id = parseTodoId(
      req.params.id
    );

    if (!id) {
      return errorResponse(
        res,
        "Invalid todo ID",
        400,
        "INVALID_ID"
      );
    }

    const todo = todos.find(
      todo => todo.id === id
    );

    if (!todo) {
      return errorResponse(
        res,
        "Todo not found",
        404,
        "NOT_FOUND"
      );
    }

    todo.completed =
      !todo.completed;

    todo.updatedAt =
      new Date();

    const message =
      todo.completed
        ? "Todo marked as completed"
        : "Todo marked as active";

    return successResponse(
      res,
      todo,
      200,
      message
    );
  }
);

// ============================================================
// BONUS: DELETE /api/todos/completed
// PHẢI đặt trước DELETE /:id
// ============================================================

app.delete(
  "/api/todos/completed",
  (req, res) => {
    const before =
      todos.length;

    todos = todos.filter(
      todo => !todo.completed
    );

    const deletedCount =
      before - todos.length;

    return res.status(200).json({
      success: true,
      message:
        `Deleted ${deletedCount} completed todos`,
      deletedCount,
    });
  }
);

// ============================================================
// DELETE /api/todos/:id
// ============================================================

app.delete(
  "/api/todos/:id",
  (req, res) => {
    const id = parseTodoId(
      req.params.id
    );

    if (!id) {
      return errorResponse(
        res,
        "Invalid todo ID",
        400,
        "INVALID_ID"
      );
    }

    const index =
      todos.findIndex(
        todo => todo.id === id
      );

    if (index === -1) {
      return errorResponse(
        res,
        "Todo not found",
        404,
        "NOT_FOUND"
      );
    }

    todos.splice(index, 1);

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Todo deleted successfully",
      });
  }
);

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  return errorResponse(
    res,
    `Cannot ${req.method} ${req.path}`,
    404,
    "NOT_FOUND"
  );
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

    if (
      err.type ===
      "entity.parse.failed"
    ) {
      return errorResponse(
        res,
        "Invalid JSON in request body",
        400,
        "INVALID_JSON"
      );
    }

    return errorResponse(
      res,
      err.message ||
        "Internal Server Error",
      err.statusCode || 500,
      "INTERNAL_ERROR"
    );
  }
);

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log(
    `TODO API running on http://localhost:${PORT}`
  );

  console.log("\nEndpoints:");

  console.log(
    "GET    /api/todos"
  );

  console.log(
    "POST   /api/todos"
  );

  console.log(
    "GET    /api/todos/:id"
  );

  console.log(
    "PATCH  /api/todos/:id"
  );

  console.log(
    "PATCH  /api/todos/:id/complete"
  );

  console.log(
    "DELETE /api/todos/:id"
  );

  console.log(
    "DELETE /api/todos/completed"
  );
});