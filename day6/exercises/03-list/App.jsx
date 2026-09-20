/**
 * Bài 3: Render List
 * Day 6 - React cơ bản
 */

const products = [
  { id: 1, name: "Laptop Dell XPS 13", price: 28000000, category: "laptop", rating: 4, inStock: true },
  { id: 2, name: "Chuột Logitech MX Master", price: 2500000, category: "peripheral", rating: 5, inStock: true },
  { id: 3, name: "Tai nghe Sony WH-1000XM5", price: 8000000, category: "audio", rating: 4, inStock: false },
  { id: 4, name: "Bàn phím Keychron K2", price: 2200000, category: "peripheral", rating: 3, inStock: true },
  { id: 5, name: "Màn hình LG 27UL850", price: 12000000, category: "monitor", rating: 4, inStock: false },
];

function ProductCard({ name, price, category, rating, inStock }) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, width: 220, opacity: inStock ? 1 : 0.5 }}>
      <h3>{name}</h3>
      <p>{price.toLocaleString("vi-VN")} VND</p>
      <p>{category}</p>
      <p>{stars}</p>
      <strong style={{ color: inStock ? "green" : "red" }}>
        {inStock ? "Còn hàng" : "Hết hàng"}
      </strong>
    </div>
  );
}

function ProductList({ products }) {
  if (products.length === 0) return <p>Không có sản phẩm nào.</p>;

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

function FilteredProductList({ products, category }) {
  const filtered = category === "all"
    ? products
    : products.filter((product) => product.category === category);

  return (
    <div>
      <p>Hiển thị {filtered.length} sản phẩm</p>
      <ProductList products={filtered} />
    </div>
  );
}

function SortedProductList({ products, sortBy }) {
  const sorted = [...products].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name, "vi");
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return <ProductList products={sorted} />;
}

function App() {
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1>Day 6 — Exercise 03: Render List</h1>

      <h2>3.2 — ProductList (tất cả)</h2>
      <ProductList products={products} />

      <h2>3.2 — ProductList (empty)</h2>
      <ProductList products={[]} />

      <h2>3.3 — FilteredProductList (category: peripheral)</h2>
      <FilteredProductList products={products} category="peripheral" />

      <h2>3.3 — FilteredProductList (category: all)</h2>
      <FilteredProductList products={products} category="all" />

      <h2>3.3 — FilteredProductList (category: phone — empty)</h2>
      <FilteredProductList products={products} category="phone" />

      <h2>3.4 — SortedProductList (by price)</h2>
      <SortedProductList products={products} sortBy="price" />

      <h2>3.4 — SortedProductList (by rating)</h2>
      <SortedProductList products={products} sortBy="rating" />
    </div>
  );
}

export default App;

// Q1: Không nên dùng index làm key khi list có thể thêm/xóa/sort vì index đổi theo vị trí, React có thể ghép nhầm state của item cũ sang item mới.
// Q2: products.sort() mutate mảng gốc. [...products].sort() tạo mảng mới, giữ nguyên props/state và phù hợp với nguyên tắc immutable của React.
// Q3: Với list lớn, filter mỗi lần gõ có thể tốn chi phí. Có thể dùng useMemo để cache kết quả và debounce input nếu cần.
