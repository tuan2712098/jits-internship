const app =
  require("./app");

const PORT =
  process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(
    `Todo API (layered) running on http://localhost:${PORT}`
  );
});