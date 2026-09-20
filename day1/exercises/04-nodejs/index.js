const calculator = require("./calculator");

console.log("Add:", calculator.add(10, 5));
console.log("Subtract:", calculator.subtract(10, 5));
console.log("Multiply:", calculator.multiply(10, 5));
console.log("Divide:", calculator.divide(10, 5));
try {
  calculator.divide(10, 0);
} catch (err) {
  console.error(err.message);
}