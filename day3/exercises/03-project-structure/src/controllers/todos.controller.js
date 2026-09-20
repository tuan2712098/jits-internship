const todosService =
  require("../services/todos.service");

async function getAll(
  req,
  res,
  next
) {
  try {
    const todos =
      await todosService.getAllTodos(
        req.query
      );

    res.status(200).json({
      success: true,
      data: todos,
      total: todos.length,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(
  req,
  res,
  next
) {
  try {
    const todo =
      await todosService.getTodoById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (err) {
    next(err);
  }
}

async function create(
  req,
  res,
  next
) {
  try {
    const todo =
      await todosService.createTodo(
        req.body
      );

    res.status(201).json({
      success: true,
      data: todo,
      message:
        "Todo created successfully",
    });
  } catch (err) {
    next(err);
  }
}

async function update(
  req,
  res,
  next
) {
  try {
    const todo =
      await todosService.updateTodo(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      data: todo,
      message:
        "Todo updated",
    });
  } catch (err) {
    next(err);
  }
}

async function toggleComplete(
  req,
  res,
  next
) {
  try {
    const result =
      await todosService.toggleComplete(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: result.todo,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(
  req,
  res,
  next
) {
  try {
    await todosService.deleteTodo(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Todo deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  toggleComplete,
  remove,
};