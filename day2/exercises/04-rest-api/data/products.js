/**
 * In-memory data store cho Products
 * Day 2 - Exercise 04
 *
 * Module này đóng vai trò "database" đơn giản.
 * Tất cả data lưu trong mảng, mất khi restart server.
 */

// ============================================================
// Data ban đầu
// ============================================================

let products = [
  {
    id: 1,
    name: "Laptop Dell XPS 15",
    price: 35000000,
    category: "tech",
    description: "Laptop cao cấp cho lập trình viên",
    inStock: true,
    quantity: 10,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    price: 28000000,
    category: "tech",
    description: "Điện thoại flagship của Apple",
    inStock: true,
    quantity: 25,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: 3,
    name: "Bàn làm việc standing desk",
    price: 8500000,
    category: "furniture",
    description: "Bàn đứng thông minh, điều chỉnh được độ cao",
    inStock: false,
    quantity: 0,
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
  {
    id: 4,
    name: "Ghế văn phòng Herman Miller",
    price: 15000000,
    category: "furniture",
    description: "Ghế ergonomic cao cấp",
    inStock: true,
    quantity: 5,
    createdAt: new Date("2024-01-04"),
    updatedAt: new Date("2024-01-04"),
  },
  {
    id: 5,
    name: "Màn hình 4K LG 27 inch",
    price: 12000000,
    category: "tech",
    description: "Màn hình 4K cho đồ họa và lập trình",
    inStock: true,
    quantity: 8,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
];

let nextId = 6;

// ============================================================
// Data access functions
// ============================================================

const getAll = (options = {}) => {
  let result = [...products];

  // Filter theo category
  if (options.category) {
    result = result.filter(
      p => p.category === options.category
    );
  }

  // Filter theo inStock
  if (options.inStock !== undefined) {
    const inStockBool =
      options.inStock === "true" ||
      options.inStock === true;

    result = result.filter(
      p => p.inStock === inStockBool
    );
  }

  // Filter theo price
  if (options.minPrice !== undefined) {
    const min = Number(options.minPrice);

    result = result.filter(
      p => p.price >= min
    );
  }

  if (options.maxPrice !== undefined) {
    const max = Number(options.maxPrice);

    result = result.filter(
      p => p.price <= max
    );
  }

  // Search name + description
  if (options.search) {
    const keyword = options.search.toLowerCase();

    result = result.filter(
      p =>
        p.name.toLowerCase().includes(keyword) ||
        (
          p.description &&
          p.description
            .toLowerCase()
            .includes(keyword)
        )
    );
  }

  // Sort
  if (options.sort) {
    const order =
      options.order === "desc" ? -1 : 1;

    result.sort((a, b) => {
      if (a[options.sort] < b[options.sort]) {
        return -1 * order;
      }

      if (a[options.sort] > b[options.sort]) {
        return 1 * order;
      }

      return 0;
    });
  }

  return result;
};

const getById = id => {
  return products.find(
    p => p.id === Number(id)
  );
};

const create = data => {
  const now = new Date();

  const product = {
    id: nextId++,
    name: data.name,
    price: data.price,
    category:
      data.category || "uncategorized",
    description:
      data.description || "",
    inStock:
      data.inStock !== undefined
        ? data.inStock
        : true,
    quantity:
      data.quantity || 0,
    createdAt: now,
    updatedAt: now,
  };

  products.push(product);

  return product;
};

const replace = (id, data) => {
  const index = products.findIndex(
    p => p.id === Number(id)
  );

  if (index === -1) {
    return null;
  }

  const updatedProduct = {
    id: Number(id),
    name: data.name,
    price: data.price,
    category:
      data.category || "uncategorized",
    description:
      data.description || "",
    inStock:
      data.inStock !== undefined
        ? data.inStock
        : true,
    quantity:
      data.quantity || 0,

    // Giữ nguyên ngày tạo
    createdAt: products[index].createdAt,

    updatedAt: new Date(),
  };

  products[index] = updatedProduct;

  return updatedProduct;
};

const update = (id, data) => {
  const index = products.findIndex(
    p => p.id === Number(id)
  );

  if (index === -1) {
    return null;
  }

  // Không cho PATCH thay id và createdAt
  const {
    id: _id,
    createdAt: _createdAt,
    ...allowedFields
  } = data;

  products[index] = {
    ...products[index],
    ...allowedFields,
    updatedAt: new Date(),
  };

  return products[index];
};

const remove = id => {
  const index = products.findIndex(
    p => p.id === Number(id)
  );

  if (index === -1) {
    return false;
  }

  products.splice(index, 1);

  return true;
};

const getCategories = () => {
  return [
    ...new Set(
      products.map(p => p.category)
    ),
  ];
};

const getStats = () => {
  return {
    total: products.length,

    inStock: products.filter(
      p => p.inStock
    ).length,

    outOfStock: products.filter(
      p => !p.inStock
    ).length,

    totalValue: products.reduce(
      (sum, p) =>
        sum + p.price * p.quantity,
      0
    ),

    byCategory: products.reduce(
      (acc, p) => {
        acc[p.category] =
          (acc[p.category] || 0) + 1;

        return acc;
      },
      {}
    ),
  };
};

module.exports = {
  getAll,
  getById,
  create,
  replace,
  update,
  remove,
  getCategories,
  getStats,
};