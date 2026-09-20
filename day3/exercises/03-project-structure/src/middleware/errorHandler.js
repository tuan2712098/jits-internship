function notFoundHandler(
  req,
  res
) {
  res.status(404).json({
    success: false,
    error:
      `Cannot ${req.method} ${req.path}`,
    code: "NOT_FOUND",
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
    return res
      .status(400)
      .json({
        success: false,
        error:
          "Invalid JSON",
        code:
          "INVALID_JSON",
      });
  }

  res
    .status(
      err.statusCode || 500
    )
    .json({
      success: false,

      error:
        err.message ||
        "Internal Server Error",

      ...(process.env
        .NODE_ENV ===
        "development" && {
        stack: err.stack,
      }),
    });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};