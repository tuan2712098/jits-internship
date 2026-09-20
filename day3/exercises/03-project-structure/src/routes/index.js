const router =
  require("express").Router();

const todosRouter =
  require("./todos.routes");

router.use(
  "/todos",
  todosRouter
);

router.get(
  "/health",
  (req, res) => {
    res.json({
      status: "ok",
      uptime:
        process.uptime(),
    });
  }
);

module.exports = router;