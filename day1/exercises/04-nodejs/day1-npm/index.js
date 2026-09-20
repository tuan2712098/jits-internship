const _ = require("lodash");

const products = [
  { id: 1, name: "Laptop", category: "tech" },
  { id: 2, name: "Phone", category: "tech" },
  { id: 3, name: "Desk", category: "furniture" },
  { id: 4, name: "Chair", category: "furniture" },
  { id: 5, name: "Monitor", category: "tech" },
];

const groupedProducts = _.groupBy(products, "category");

console.log(groupedProducts);