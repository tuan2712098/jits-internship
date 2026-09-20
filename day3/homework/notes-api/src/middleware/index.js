const jwt = require("jsonwebtoken");

function validate(schema, source = "body") {
  return (req, res, next) => {
    const { error, value } =
      schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.details.map(
          detail => ({
            field:
              detail.path.join("."),
            message:
              detail.message,
          })
        ),
      });
    }

    req[source] = value;

    next();
  };
}

function authenticate(req, res, next) {
  const authHeader =
    req.get("Authorization");

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      error:
        "Authentication token required",
    });
  }

  const token =
    authHeader.slice(7);

  try {
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error:
        error.name === "TokenExpiredError"
          ? "Token expired"
          : "Invalid token",
    });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error:
          "Authentication required",
      });
    }

    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        error:
          "You do not have permission to access this resource",
      });
    }

    next();
  };
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error:
      `Cannot ${req.method} ${req.path}`,
  });
}

function errorHandler(
  err,
  req,
  res,
  next
) {
  console.error(
    "[ERROR]",
    err.message
  );

  if (
    err.type ===
    "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON",
    });
  }

  res.status(
    err.statusCode || 500
  ).json({
    success: false,
    error:
      err.message ||
      "Internal Server Error",

    ...(process.env.NODE_ENV ===
      "development" && {
      stack: err.stack,
    }),
  });
}

module.exports = {
  validate,
  authenticate,
  authorize,
  notFoundHandler,
  errorHandler,
};