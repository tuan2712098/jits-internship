const app =
  require("./app");

const {
  seedAdmin,
} =
  require("./data/store");

const PORT =
  process.env.PORT || 3005;

async function startServer() {
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(
      `Notes API running on http://localhost:${PORT}`
    );

    console.log(
      "Admin: admin@example.com / Admin@123"
    );
  });
}

startServer().catch(err => {
  console.error(
    "Failed to start server:",
    err
  );

  process.exit(1);
});