/**
 * Bài 2: Props & Component Tree
 * Day 6 - React cơ bản
 */

function ProductCard({ name, price, category, inStock }) {
  return (
    <div className="product-card" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minWidth: 220 }}>
      <h3>{name}</h3>
      <p className="price">{price.toLocaleString("vi-VN")} VND</p>
      <span className="category-badge" style={{ display: "inline-block", marginBottom: 12 }}>{category}</span>
      <br />
      <button
        disabled={!inStock}
        style={{ backgroundColor: inStock ? "#4CAF50" : "#ccc", color: "white", border: 0, padding: "8px 12px", borderRadius: 4 }}
      >
        {inStock ? "Mua ngay" : "Hết hàng"}
      </button>
    </div>
  );
}

function ProductCardPro({
  name,
  price,
  category,
  inStock,
  discount = 0,
  onAddToCart,
}) {
  const finalPrice = price * (1 - discount / 100);

  return (
    <div className="product-card" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minWidth: 220 }}>
      <h3>{name}</h3>
      <p>{category}</p>
      {discount > 0 ? (
        <p>
          <s>{price.toLocaleString("vi-VN")} VND</s>{" "}
          <strong>{finalPrice.toLocaleString("vi-VN")} VND</strong>{" "}
          <span>-{discount}%</span>
        </p>
      ) : (
        <p><strong>{price.toLocaleString("vi-VN")} VND</strong></p>
      )}
      <button
        disabled={!inStock}
        onClick={() => onAddToCart?.({ name, price, finalPrice })}
        style={{ backgroundColor: inStock ? "#4CAF50" : "#ccc", color: "white", border: 0, padding: "8px 12px", borderRadius: 4 }}
      >
        {inStock ? "Mua ngay" : "Hết hàng"}
      </button>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      {children}
    </div>
  );
}

function App() {
  const handleAddToCart = (product) => {
    console.log("Added to cart:", product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!\nGiá: ${product.finalPrice.toLocaleString("vi-VN")} VND`);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <h1>Day 6 — Exercise 02: Props</h1>

      <h2>2.1 — ProductCard cơ bản</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ProductCard name="Laptop Dell XPS 13" price={28000000} category="laptop" inStock={true} />
        <ProductCard name="Tai nghe Sony WH-1000XM5" price={8000000} category="audio" inStock={false} />
        <ProductCard name="Chuột Logitech MX Master" price={2500000} category="peripheral" inStock={true} />
      </div>

      <h2>2.2 — ProductCard với discount & callback</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ProductCardPro name="Laptop Dell XPS 13" price={28000000} category="laptop" inStock={true} discount={15} onAddToCart={handleAddToCart} />
        <ProductCardPro name="Bàn phím Keychron K2" price={2200000} category="peripheral" inStock={true} onAddToCart={handleAddToCart} />
        <ProductCardPro name="Màn hình LG 27UL850" price={12000000} category="monitor" inStock={false} discount={10} />
      </div>

      <h2>2.3 — Card wrapper (children)</h2>
      <Card title="Thông tin cá nhân">
        <p>Tên: Nguyen Van A</p>
        <p>Email: nguyenvana@example.com</p>
        <button>Chỉnh sửa</button>
      </Card>
      <Card title="Ghi chú">
        <ul>
          <li>Học React JSX</li>
          <li>Làm bài tập Props</li>
          <li>Review code</li>
        </ul>
      </Card>
      <Card>
        <p>Card không có title — chỉ có children</p>
      </Card>
    </div>
  );
}

export default App;

// Q1: Props là read-only để giữ one-way data flow, giúp dữ liệu dễ theo dõi và debug. Component con muốn thay đổi dữ liệu phải gọi callback do cha truyền xuống.
// Q2: Nếu gọi onAddToCart() khi prop là undefined thì JavaScript ném TypeError. Optional chaining giúp chỉ gọi khi function tồn tại.
// Q3: children phù hợp cho nội dung lồng tự nhiên giữa thẻ mở/đóng. Named prop phù hợp khi component có nhiều vùng nội dung cần đặt tên rõ ràng.
