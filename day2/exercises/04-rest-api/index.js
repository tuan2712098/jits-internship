const express = require("express");

const app = express();

const productsRouter =
  require("./routes/products");

const {
  requestLogger,
  notFoundHandler,
  errorHandler,
} = require("./middleware");

const PORT = 3004;

app.use(express.json());

app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    message: "Products API v1.0",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(
  "/api/products",
  productsRouter
);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Products API running on http://localhost:${PORT}`
  );
});