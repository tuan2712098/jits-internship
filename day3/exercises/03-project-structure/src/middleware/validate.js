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
      const details =
        error.details.map(
          item => ({
            field:
              item.path.join("."),
            message:
              item.message,
          })
        );

      return res
        .status(400)
        .json({
          success: false,
          error:
            "Validation failed",
          details,
        });
    }

    req[source] = value;

    next();
  };
}

module.exports = validate;