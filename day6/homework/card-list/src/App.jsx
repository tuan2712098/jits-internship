import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ProductList from "./components/ProductList";
import "./App.css";

const products = [
  { id: 1, name: "Laptop Dell XPS 13", price: 28000000, category: "laptop", rating: 4, inStock: true },
  { id: 2, name: "Chuột Logitech MX Master", price: 2500000, category: "peripheral", rating: 5, inStock: true },
  { id: 3, name: "Tai nghe Sony WH-1000XM5", price: 8000000, category: "audio", rating: 4, inStock: false },
  { id: 4, name: "Bàn phím Keychron K2", price: 2200000, category: "peripheral", rating: 3, inStock: true },
  { id: 5, name: "Màn hình LG 27UL850", price: 12000000, category: "monitor", rating: 4, inStock: false },
  { id: 6, name: "Webcam Logitech C920", price: 1800000, category: "peripheral", rating: 3, inStock: true },
  { id: 7, name: "Ổ cứng SSD Samsung 1TB", price: 3500000, category: "storage", rating: 5, inStock: true },
  { id: 8, name: "Loa JBL Flip 6", price: 2800000, category: "audio", rating: 4, inStock: true },
  { id: 9, name: "Laptop MacBook Air M2", price: 32000000, category: "laptop", rating: 5, inStock: false },
  { id: 10, name: "Chuột Razer DeathAdder", price: 1200000, category: "peripheral", rating: 4, inStock: true },
];

function App() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [cart, setCart] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchSearch = !keyword || product.name.toLowerCase().includes(keyword);
      const matchCategory = filterCategory === "all" || product.category === filterCategory;
      const matchStock = !showInStockOnly || product.inStock;
      return matchSearch && matchCategory && matchStock;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.name.localeCompare(b.name, "vi");
    });
  }, [search, filterCategory, showInStockOnly, sortBy]);

  const handleAddToCart = useCallback((id) => {
    setCart((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleRemoveFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((cartId) => cartId !== id));
  }, []);

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Product Store</h1>
          <p>Day 6 React Homework</p>
        </div>
        <div className="cart-box">Giỏ hàng: <strong>{cart.length}</strong></div>
      </header>

      <section className="filters">
        <div className="search-row">
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm..."
          />
          <button onClick={() => searchRef.current?.focus()}>Focus</button>
        </div>

        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={filterCategory === category ? "active" : ""}
              onClick={() => setFilterCategory(category)}
            >
              {category === "all" ? "All" : category}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <label>
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
            />{" "}
            Chỉ còn hàng
          </label>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Theo tên</option>
            <option value="price-asc">Giá tăng</option>
            <option value="price-desc">Giá giảm</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </section>

      <p className="result-count">{filteredAndSortedProducts.length} sản phẩm</p>

      <ProductList
        products={filteredAndSortedProducts}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />
    </div>
  );
}

export default App;
