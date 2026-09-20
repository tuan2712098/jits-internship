import { memo } from "react";

function ProductCard({
  id,
  name,
  price,
  category,
  rating,
  inStock,
  isInCart,
  onAddToCart,
  onRemoveFromCart,
}) {
  console.log("ProductCard rendered:", name);

  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <article className={`product-card ${!inStock ? "out-of-stock" : ""} ${isInCart ? "in-cart" : ""}`}>
      <span className="category-badge">{category}</span>
      <h3>{name}</h3>
      <p className="price">{price.toLocaleString("vi-VN")} ₫</p>
      <p className="stars" aria-label={`${rating} trên 5 sao`}>{stars}</p>
      <p className={inStock ? "stock-ok" : "stock-no"}>{inStock ? "Còn hàng" : "Hết hàng"}</p>

      {!inStock ? (
        <button disabled>Hết hàng</button>
      ) : isInCart ? (
        <button className="remove-btn" onClick={() => onRemoveFromCart(id)}>Xóa khỏi giỏ</button>
      ) : (
        <button className="add-btn" onClick={() => onAddToCart(id)}>Thêm vào giỏ</button>
      )}
    </article>
  );
}

export default memo(ProductCard);
