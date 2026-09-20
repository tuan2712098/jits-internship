/**
 * Bài 4: useState vs let
 * Day 6 - React Hooks cơ bản
 */

import { useState } from "react";

function CounterWithLet() {
  // let không trigger re-render. Mỗi lần component render lại, biến local này cũng được tạo lại từ đầu.
  let count = 0;

  function handleClick() {
    count += 1;
    console.log("let count:", count);
  }

  console.log("CounterWithLet rendered");

  return (
    <div style={{ border: "2px solid red", padding: 16, borderRadius: 8 }}>
      <h3>Counter với let (SAI)</h3>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Tăng</button>
      <p style={{ color: "red", fontSize: 12 }}>Mở Console để thấy giá trị thực — UI không cập nhật!</p>
    </div>
  );
}

function CounterWithState() {
  const [count, setCount] = useState(0);
  console.log("CounterWithState rendered");

  const increase = () => {
    setCount(count + 1);
    console.log("state count:", count + 1);
  };

  const decrease = () => {
    setCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div style={{ border: "2px solid green", padding: 16, borderRadius: 8 }}>
      <h3>Counter với useState (ĐÚNG)</h3>
      <p>Count: {count}</p>
      <button onClick={increase}>Tăng</button>{" "}
      <button onClick={decrease}>Giảm</button>{" "}
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

function DoubleCounter() {
  const [count, setCount] = useState(0);

  const increaseWrong = () => {
    setCount(count + 1);
    setCount(count + 1);
  };

  const increaseCorrect = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  };

  return (
    <div style={{ border: "2px solid blue", padding: 16, borderRadius: 8 }}>
      <h3>Double Counter — Functional Update</h3>
      <p>Count: {count}</p>
      <button onClick={increaseWrong}>Tăng 2 (SAI — sẽ chỉ tăng 1)</button>{" "}
      <button onClick={increaseCorrect}>Tăng 2 (ĐÚNG — tăng thật sự 2)</button>{" "}
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

function UserProfile() {
  const [user, setUser] = useState({ name: "Alice", age: 25, city: "HCM" });

  const increaseWrong = () => {
    user.age += 1;
    setUser(user);
    console.log("Mutated user:", user);
  };

  const increaseCorrect = () => {
    setUser((prev) => ({ ...prev, age: prev.age + 1 }));
  };

  return (
    <div style={{ border: "2px solid purple", padding: 16, borderRadius: 8 }}>
      <h3>User Profile — Immutable Object State</h3>
      <p>Tên: {user.name}</p>
      <p>Tuổi: {user.age}</p>
      <p>Thành phố: {user.city}</p>
      <input value={user.name} onChange={(e) => setUser((prev) => ({ ...prev, name: e.target.value }))} />
      <br /><br />
      <button onClick={increaseWrong}>Tăng tuổi (SAI)</button>{" "}
      <button onClick={increaseCorrect}>Tăng tuổi (ĐÚNG)</button>
    </div>
  );
}

function TodoMini() {
  const [todos, setTodos] = useState(["Học React", "Làm bài tập"]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    const value = newTodo.trim();
    if (!value) return;
    setTodos((prev) => [...prev, value]);
    setNewTodo("");
  };

  const removeTodo = (index) => {
    setTodos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ border: "2px solid orange", padding: 16, borderRadius: 8 }}>
      <h3>Todo Mini — Immutable Array State</h3>
      <input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Todo mới" />{" "}
      <button onClick={addTodo}>Thêm</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={`${todo}-${index}`}>
            {todo} <button onClick={() => removeTodo(index)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <h1>Day 6 — Exercise 04: useState vs let</h1>
      <p style={{ color: "#666" }}>Mở DevTools Console (F12) để theo dõi log</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <CounterWithLet />
        <CounterWithState />
        <DoubleCounter />
        <UserProfile />
        <TodoMini />
      </div>
    </div>
  );
}

export default App;

// Q1: Khi state/props thay đổi, React gọi lại function component để tạo JSX mới rồi reconcile với DOM hiện tại. Biến let local không được React lưu nên có thể reset ở lần render mới.
// Q2: setUser(user) dùng cùng object reference; React so sánh state cũ/mới bằng Object.is và có thể bỏ qua update vì reference không đổi.
// Q3: let dùng cho biến tạm trong một lần chạy; useState dùng cho dữ liệu ảnh hưởng UI và cần re-render; useRef dùng cho DOM hoặc giá trị cần giữ qua render nhưng không cần re-render.
