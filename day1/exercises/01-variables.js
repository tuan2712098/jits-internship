// 1.1: Khai báo và sử dụng biến
const fullName = "Pham Anh Tuan";
let age = 21;
const isProgrammer = true;
const skills = ["HTML", "CSS", "JavaScript", "Node.js", "React.js"];

console.log("Họ tên:", fullName);
console.log("Tuổi:", age);
console.log("Là lập trình viên:", isProgrammer);
console.log("Kỹ năng:", skills);

// 1.2: Template literals
const introduction = `Tôi là ${fullName}, ${age} tuổi, là lập trình viên`;
console.log(introduction);

// 1.3: Phép toán cơ bản
const a = 10;
const b = 3;

console.log("Tổng:", a + b);
console.log("Hiệu:", a - b);
console.log("Tích:", a * b);
console.log("Thương:", a / b);

console.log("Math.round:", Math.round(5.7));
console.log("Math.floor:", Math.floor(5.7));
console.log("Math.ceil:", Math.ceil(5.7));

// 1.4: Kiểm tra kiểu
function checkType(value) {
  if (value === null) {
    console.log("null");
  } else if (Array.isArray(value)) {
    console.log("array");
  } else {
    console.log(typeof value);
  }
}

checkType("hello");
checkType(42);
checkType(true);
checkType(null);
checkType(undefined);
checkType([1, 2, 3]);
checkType({ a: 1 });