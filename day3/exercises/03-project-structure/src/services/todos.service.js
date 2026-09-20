const store = require("../data/todos.store");

function parseId(id) {
  const number = Number(id);

  if (
    !Number.isInteger(number) ||
    number <= 0
  ) {
    const err = new Error(
      "Invalid todo ID"
    );

    err.statusCode = 400;

    throw err;
  }

  return number;
}

async function getAllTodos(filter) {
  return store.getAll(filter);
}

async function getTodoById(id) {
  const todoId = parseId(id);

  const todo =
    store.getById(todoId);

  if (!todo) {
    const err = new Error(
      "Todo not found"
    );

    err.statusCode = 404;

    throw err;
  }

  return todo;
}

async function createTodo({
  title,
  priority,
}) {
  return store.create({
    title: title.trim(),
    priority,
  });
}

async function updateTodo(id, data) {
  const todoId = parseId(id);

  const todo =
    store.getById(todoId);

  if (!todo) {
    const err = new Error(
      "Todo not found"
    );

    err.statusCode = 404;

    throw err;
  }

  const updateData = {
    ...data,
  };

  if (
    updateData.title !==
    undefined
  ) {
    updateData.title =
      updateData.title.trim();
  }

  return store.update(
    todoId,
    updateData
  );
}

async function toggleComplete(id) {
  const todoId = parseId(id);

  const todo =
    store.getById(todoId);

  if (!todo) {
    const err = new Error(
      "Todo not found"
    );

    err.statusCode = 404;

    throw err;
  }

  const updatedTodo =
    store.update(todoId, {
      completed:
        !todo.completed,
    });

  return {
    todo: updatedTodo,

    message:
      updatedTodo.completed
        ? "Todo marked as completed"
        : "Todo marked as active",
  };
}

async function deleteTodo(id) {
  const todoId = parseId(id);

  const todo =
    store.getById(todoId);

  if (!todo) {
    const err = new Error(
      "Todo not found"
    );

    err.statusCode = 404;

    throw err;
  }

  store.remove(todoId);

  return true;
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo,
};