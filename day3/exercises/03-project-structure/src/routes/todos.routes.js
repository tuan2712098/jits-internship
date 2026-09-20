const router =
  require("express").Router();

const validate =
  require("../middleware/validate");

const {
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema,
} =
  require("../schemas/todo.schema");

const todosController =
  require("../controllers/todos.controller");

router.get(
  "/",
  validate(
    todoQuerySchema,
    "query"
  ),
  todosController.getAll
);

router.post(
  "/",
  validate(
    createTodoSchema
  ),
  todosController.create
);

// phải đặt trước /:id
router.patch(
  "/:id/complete",
  todosController.toggleComplete
);

router.get(
  "/:id",
  todosController.getById
);

router.patch(
  "/:id",
  validate(
    updateTodoSchema
  ),
  todosController.update
);

router.delete(
  "/:id",
  todosController.remove
);

module.exports = router;