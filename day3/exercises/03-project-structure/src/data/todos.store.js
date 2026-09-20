let todos = [];
let nextId = 1;

const getAll = (filter = {}) => {
  let result = [...todos];

  if (filter.status === "active") {
    result = result.filter(todo => !todo.completed);
  }

  if (filter.status === "completed") {
    result = result.filter(todo => todo.completed);
  }

  if (filter.priority) {
    result = result.filter(
      todo => todo.priority === filter.priority
    );
  }

  if (filter.search) {
    const keyword = filter.search.toLowerCase();

    result = result.filter(todo =>
      todo.title.toLowerCase().includes(keyword)
    );
  }

  if (filter.sort) {
    const order = filter.order === "desc" ? -1 : 1;

    result.sort((a, b) => {
      if (filter.sort === "title") {
        return a.title.localeCompare(b.title) * order;
      }

      if (filter.sort === "priority") {
        const priorityOrder = {
          low: 1,
          medium: 2,
          high: 3,
        };

        return (
          (priorityOrder[a.priority] -
            priorityOrder[b.priority]) *
          order
        );
      }

      return (
        (new Date(a.createdAt) -
          new Date(b.createdAt)) *
        order
      );
    });
  }

  return result;
};

const getById = id => {
  return (
    todos.find(
      todo => todo.id === Number(id)
    ) || null
  );
};

const create = data => {
  const todo = {
    id: nextId++,
    title: data.title,
    priority: data.priority,
    completed: false,
    createdAt: new Date(),
  };

  todos.push(todo);

  return todo;
};

const update = (id, data) => {
  const index = todos.findIndex(
    todo => todo.id === Number(id)
  );

  if (index === -1) {
    return null;
  }

  todos[index] = {
    ...todos[index],
    ...data,
    id: todos[index].id,
    createdAt: todos[index].createdAt,
    updatedAt: new Date(),
  };

  return todos[index];
};

const remove = id => {
  const index = todos.findIndex(
    todo => todo.id === Number(id)
  );

  if (index === -1) {
    return false;
  }

  todos.splice(index, 1);

  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};