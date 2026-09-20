import ProductCard from "./ProductCard";

function ProductList({ products, cart, onAddToCart, onRemoveFromCart }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>Không tìm thấy sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          isInCart={cart.includes(product.id)}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
        />
      ))}
    </div>
  );
}

export default ProductList;
