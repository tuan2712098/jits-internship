const fs = require("fs");
const path = require("path");

console.log("=== PATH INFO ===");

// Tên file hiện tại
console.log("File name:", path.basename(__filename));

// Phần mở rộng
console.log("Extension:", path.extname(__filename));

// Thư mục hiện tại
console.log("Directory:", path.dirname(__filename));

// Ghép đường dẫn
const joinedPath = path.join(__dirname, "output.txt");
console.log("Joined path:", joinedPath);

console.log("\n=== FILE OPERATIONS ===");

// Đọc nội dung của chính file này
const content = fs.readFileSync(__filename, "utf8");

// Đếm số dòng
const lines = content.split("\n");

console.log("Number of lines:", lines.length);

// Ghi file mới
const outputContent = `File được tạo lúc: ${new Date().toISOString()}`;

fs.writeFileSync(joinedPath, outputContent, "utf8");

console.log("Đã tạo output.txt thành công");

// Đọc lại file output.txt
const outputData = fs.readFileSync(joinedPath, "utf8");

console.log("Nội dung output.txt:");
console.log(outputData);