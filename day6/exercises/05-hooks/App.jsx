/**
 * Bài 5: Hooks Practice — useState, useRef, useMemo, useCallback
 * Day 6 - React Hooks cơ bản
 */

import { memo, useState, useRef, useMemo, useCallback, useEffect } from "react";

const INITIAL_CONTACTS = [
  { id: 1, name: "Nguyen Van A", email: "a@example.com", phone: "0901234567", city: "HCM" },
  { id: 2, name: "Tran Thi B", email: "b@example.com", phone: "0912345678", city: "Hanoi" },
  { id: 3, name: "Le Van C", email: "c@example.com", phone: "0923456789", city: "Da Nang" },
  { id: 4, name: "Pham Thi D", email: "d@example.com", phone: "0934567890", city: "HCM" },
  { id: 5, name: "Hoang Van E", email: "e@example.com", phone: "0945678901", city: "Hanoi" },
  { id: 6, name: "Vo Thi F", email: "f@example.com", phone: "0956789012", city: "HCM" },
  { id: 7, name: "Dang Van G", email: "g@example.com", phone: "0967890123", city: "Da Nang" },
  { id: 8, name: "Bui Thi H", email: "h@example.com", phone: "0978901234", city: "Hanoi" },
];

function SearchInput({ value, onChange, placeholder }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ padding: 8, fontSize: 14, flex: 1 }}
      />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </div>
  );
}

function RenderCounter() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <p style={{ color: "#888", fontSize: 12 }}>
      Component đã render {renderCount.current} lần
    </p>
  );
}

const ContactItem = memo(function ContactItem({ contact, onRemove }) {
  console.log("ContactItem rendered:", contact.name);

  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <strong>{contact.name}</strong>
        <p style={{ margin: "4px 0", color: "#666", fontSize: 13 }}>
          {contact.email} | {contact.phone} | {contact.city}
        </p>
      </div>
      <button onClick={() => onRemove(contact.id)} style={{ color: "red", cursor: "pointer" }}>Xóa</button>
    </div>
  );
});

function ContactList() {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("all");

  const filteredContacts = useMemo(() => {
    console.log("Filtering contacts...");
    const keyword = search.trim().toLowerCase();

    return contacts
      .filter((contact) => {
        if (!keyword) return true;
        return contact.name.toLowerCase().includes(keyword) || contact.email.toLowerCase().includes(keyword);
      })
      .filter((contact) => filterCity === "all" || contact.city === filterCity);
  }, [contacts, search, filterCity]);

  const handleRemove = useCallback((id) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  }, []);

  const cities = ["all", "HCM", "Hanoi", "Da Nang"];

  return (
    <div>
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên hoặc email..."
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setFilterCity(city)}
            style={{
              padding: "6px 12px",
              backgroundColor: filterCity === city ? "#2563eb" : "#eee",
              color: filterCity === city ? "white" : "black",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {city === "all" ? "Tất cả" : city}
          </button>
        ))}
      </div>

      <p>Hiển thị {filteredContacts.length} / {contacts.length} contacts</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filteredContacts.length === 0 ? (
          <p style={{ color: "#999" }}>Không tìm thấy contact nào.</p>
        ) : (
          filteredContacts.map((contact) => (
            <ContactItem key={contact.id} contact={contact} onRemove={handleRemove} />
          ))
        )}
      </div>

      <RenderCounter />
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <h1>Day 6 — Exercise 05: Hooks Practice</h1>
      <p style={{ color: "#666" }}>Mở DevTools Console (F12) để theo dõi render và filter logs</p>
      <ContactList />
    </div>
  );
}

export default App;

// Q1: Không dùng useMemo thì phép filter chạy lại mỗi lần component re-render, kể cả khi inputs liên quan không đổi.
// Q2: Không dùng useCallback thì mỗi render tạo function handleRemove mới; với child được memo hóa, prop function mới vẫn khiến child re-render.
// Q3: Functional update luôn nhận state mới nhất và cho phép deps của useCallback là [], tránh stale closure và giữ callback ổn định.
// Q4: useRef thay đổi current mà không gây re-render, nên phù hợp để đếm render. useState sẽ tự kích hoạt render và có thể tạo vòng lặp.
