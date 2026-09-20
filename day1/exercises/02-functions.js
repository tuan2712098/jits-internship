// ============================================================
// Bài 2.1: Functions
// ============================================================

// a) Function declaration
function rectangleArea1(width, height) {
  return width * height;
}

// b) Function expression
const rectangleArea2 = function (width, height) {
  return width * height;
};

// c) Arrow function
const rectangleArea3 = (width, height) => width * height;

console.log("Diện tích 1:", rectangleArea1(5, 3));
console.log("Diện tích 2:", rectangleArea2(5, 3));
console.log("Diện tích 3:", rectangleArea3(5, 3));


// Kiểm tra số chẵn lẻ - 3 cách

function checkEvenOdd1(number) {
  return number % 2 === 0 ? "Chẵn" : "Lẻ";
}

const checkEvenOdd2 = function (number) {
  return number % 2 === 0 ? "Chẵn" : "Lẻ";
};

const checkEvenOdd3 = (number) => {
  return number % 2 === 0 ? "Chẵn" : "Lẻ";
};

console.log(checkEvenOdd1(10));
console.log(checkEvenOdd2(7));
console.log(checkEvenOdd3(20));


// Đảo ngược chuỗi - 3 cách

function reverseString1(str) {
  return str.split("").reverse().join("");
}

const reverseString2 = function (str) {
  return str.split("").reverse().join("");
};

const reverseString3 = (str) => str.split("").reverse().join("");

console.log(reverseString1("hello"));
console.log(reverseString2("javascript"));
console.log(reverseString3("nodejs"));


// ============================================================
// Bài 2.2: Array methods
// ============================================================

const products = [
  { id: 1, name: "Laptop", price: 25000000, category: "tech", inStock: true },
  { id: 2, name: "Phone", price: 15000000, category: "tech", inStock: false },
  { id: 3, name: "Desk", price: 5000000, category: "furniture", inStock: true },
  { id: 4, name: "Chair", price: 3000000, category: "furniture", inStock: true },
  { id: 5, name: "Monitor", price: 8000000, category: "tech", inStock: true },
];

// a) Lấy tên tất cả sản phẩm
const allNames = products.map(product => product.name);

// b) Lọc sản phẩm còn hàng
const inStockProducts = products.filter(product => product.inStock);

// c) Sản phẩm tech VÀ còn hàng
const techInStock = products.filter(
  product => product.category === "tech" && product.inStock
);

// d) Tổng giá trị sản phẩm còn hàng
const totalValue = products
  .filter(product => product.inStock)
  .reduce((sum, product) => sum + product.price, 0);

// e) Sản phẩm đắt nhất
const mostExpensive = products.reduce((max, product) =>
  product.price > max.price ? product : max
);

// f) Sắp xếp giá tăng dần
// [...products] để không làm thay đổi mảng products gốc
const sortedByPrice = [...products].sort(
  (a, b) => a.price - b.price
);

console.log("All names:", allNames);
console.log("In stock:", inStockProducts.map(p => p.name));
console.log("Tech in stock:", techInStock.map(p => p.name));
console.log("Total value:", totalValue.toLocaleString("vi-VN"), "VND");
console.log("Most expensive:", mostExpensive.name);
console.log("Sorted:", sortedByPrice.map(p => `${p.name}: ${p.price}`));


// ============================================================
// Bài 2.3: Destructuring
// ============================================================

function printUserInfo({
  firstName,
  lastName,
  age,
  address: { city, district },
}) {
  console.log(
    `${lastName} ${firstName} (${age} tuoi) - ${district}, ${city}`
  );
}

printUserInfo({
  firstName: "Van A",
  lastName: "Nguyen",
  age: 25,
  address: {
    city: "HCM",
    district: "Quan 1",
  },
});