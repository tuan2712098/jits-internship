/**
 * Homework: TODO App
 * Day 1 - Bài tập về nhà
 *
 * Xây dựng ứng dụng quản lý TODO chạy trên terminal
 * Dùng async/await cho tất cả operations (mô phỏng delay 200ms)
 */

// ============================================================
// Data store (in-memory)
// ============================================================

let todos = [];
let nextId = 1;

// Helper: mô phỏng async delay
const delay = (ms = 200) =>
  new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// Core functions
// ============================================================

/**
 * Thêm todo mới
 */
async function addTodo(title, priority = "medium") {
  await delay();

  // Validate title
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("Title không được để trống");
  }

  // Validate priority
  const validPriorities = ["low", "medium", "high"];

  if (!validPriorities.includes(priority)) {
    throw new Error("Priority không hợp lệ");
  }

  const todo = {
    id: nextId++,
    title: title.trim(),
    priority,
    completed: false,
    createdAt: new Date(),
  };

  todos.push(todo);

  return todo;
}

/**
 * Đánh dấu todo đã hoàn thành
 */
async function completeTodo(id) {
  await delay();

  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    throw new Error(`Không tìm thấy todo có id ${id}`);
  }

  todo.completed = true;

  return todo;
}

/**
 * Xóa todo
 */
async function deleteTodo(id) {
  await delay();

  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    throw new Error(`Không tìm thấy todo có id ${id}`);
  }

  todos.splice(index, 1);

  return true;
}

/**
 * Liệt kê todos
 */
async function listTodos(filter = "all") {
  await delay();

  if (filter === "all") {
    return todos;
  }

  if (filter === "active") {
    return todos.filter(todo => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter(todo => todo.completed);
  }

  throw new Error(
    "Filter không hợp lệ. Chỉ chấp nhận: all, active, completed"
  );
}

/**
 * Tìm kiếm todos theo keyword
 */
async function searchTodos(keyword) {
  await delay();

  if (typeof keyword !== "string" || keyword.trim() === "") {
    throw new Error("Keyword không được để trống");
  }

  const searchText = keyword.toLowerCase().trim();

  return todos.filter(todo =>
    todo.title.toLowerCase().includes(searchText)
  );
}

// ============================================================
// Display helper
// ============================================================

function displayTodo(todo) {
  const status = todo.completed ? "[x]" : "[ ]";

  const priority = {
    low: "LOW ",
    medium: "MED ",
    high: "HIGH",
  }[todo.priority];

  console.log(
    `  ${status} [${priority}] #${todo.id} - ${todo.title}`
  );
}

// ============================================================
// Main - Demo chạy thử các chức năng
// ============================================================

async function main() {
  console.log("=== TODO APP ===\n");

  // Thêm todos
  console.log("Adding todos...");

  await addTodo("Học JavaScript cơ bản", "high");
  await addTodo("Đọc tài liệu Node.js", "high");
  await addTodo("Làm bài tập async/await", "medium");
  await addTodo("Setup VS Code extensions", "low");
  await addTodo("Push code lên GitHub", "medium");

  // Liệt kê tất cả
  console.log("\nAll todos:");

  const all = await listTodos("all");

  all.forEach(displayTodo);

  // Hoàn thành todo #1
  console.log("\nCompleting todo #1...");

  await completeTodo(1);

  // Liệt kê active
  console.log("\nActive todos:");

  const active = await listTodos("active");

  active.forEach(displayTodo);

  // Liệt kê completed
  console.log("\nCompleted todos:");

  const completed = await listTodos("completed");

  completed.forEach(displayTodo);

  // Tìm kiếm
  console.log("\nSearch 'node':");

  const results = await searchTodos("node");

  results.forEach(displayTodo);

  // Xóa todo
  console.log("\nDeleting todo #4...");

  await deleteTodo(4);

  // Liệt kê sau khi xóa
  console.log("\nAll todos after delete:");

  const remaining = await listTodos("all");

  remaining.forEach(displayTodo);

  // ==========================================================
  // Test error handling
  // ==========================================================

  console.log("\nTesting error handling...");

  try {
    await completeTodo(999);
  } catch (err) {
    console.log("Expected error:", err.message);
  }

  try {
    await addTodo("", "high");
  } catch (err) {
    console.log("Expected error:", err.message);
  }

  try {
    await addTodo("Todo test", "super-high");
  } catch (err) {
    console.log("Expected error:", err.message);
  }

  try {
    await listTodos("abc");
  } catch (err) {
    console.log("Expected error:", err.message);
  }
}

// Chạy chương trình
main().catch(console.error);