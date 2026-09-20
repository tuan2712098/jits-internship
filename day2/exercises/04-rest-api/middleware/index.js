function requestLogger(req, res, next) {
  const start = Date.now();

  console.log(
    `[${new Date().toISOString()}] --> ${req.method} ${req.path}`
  );

  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] <-- ${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`
    );
  });

  next();
}

function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (
        rules.type &&
        typeof value !== rules.type
      ) {
        errors.push(
          `${field} must be a ${rules.type}`
        );
        continue;
      }

      if (
        rules.min !== undefined &&
        typeof value === "number" &&
        value < rules.min
      ) {
        errors.push(
          `${field} must be at least ${rules.min}`
        );
      }

      if (
        rules.minLength !== undefined &&
        typeof value === "string" &&
        value.length < rules.minLength
      ) {
        errors.push(
          `${field} must be at least ${rules.minLength} characters`
        );
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    next();
  };
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
}

module.exports = {
  requestLogger,
  validateBody,
  notFoundHandler,
  errorHandler,
};