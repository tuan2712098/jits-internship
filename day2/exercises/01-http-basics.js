/**
 * Bài tập 1 - HTTP Basics
 * Day 2 - Express.js & REST API
 */

const http = require("http");
const url = require("url");

const PORT = 3001;

// ============================================================
// 1.1: Kiến thức lý thuyết
// ============================================================

/**
 * Q1: HTTP method nào KHÔNG có request body?
 * A1: GET và HEAD thông thường không dùng request body.
 *
 * Q2: Status code 201 khác 200 ở điểm nào? Khi nào dùng 201?
 * A2: 200 là request thành công nói chung.
 *     201 dùng khi request thành công và tạo mới resource.
 *
 * Q3: Status code 204 có response body không? Dùng khi nào?
 * A3: Không có response body.
 *     Thường dùng khi xử lý thành công nhưng không cần trả dữ liệu.
 *
 * Q4: Phân biệt 401 và 403?
 * A4: 401 là chưa xác thực.
 *     403 là đã xác thực nhưng không có quyền truy cập.
 *
 * Q5: PUT và PATCH khác nhau thế nào?
 * A5: PUT thường thay thế toàn bộ resource.
 *     PATCH chỉ cập nhật một phần resource.
 *
 * Q6: Idempotent nghĩa là gì?
 * A6: Gọi request nhiều lần vẫn tạo ra trạng thái cuối giống nhau.
 *     GET, PUT, DELETE là idempotent.
 *     POST thường không idempotent.
 *
 * Q7: Header Content-Type: application/json nói với server điều gì?
 * A7: Request body được gửi dưới định dạng JSON.
 *
 * Q8: Query string trong /api/users?page=2&limit=10 là gì?
 * A8: page=2&limit=10.
 */

// ============================================================
// 1.2: HTTP Server
// ============================================================

const startTime = Date.now();

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Gửi JSON response
  const sendJSON = (statusCode, data) => {
    const body = JSON.stringify(data, null, 2);

    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "X-Powered-By": "Node.js http module",
    });

    res.end(body);
  };

  // Đọc request body
  const readBody = () => {
    return new Promise((resolve, reject) => {
      let body = "";

      req.on("data", chunk => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          reject(new Error("Invalid JSON body"));
        }
      });

      req.on("error", reject);
    });
  };

  const handleRequest = async () => {
    // GET /
    if (req.method === "GET" && pathname === "/") {
      sendJSON(200, {
        message: "HTTP Basics Demo",
        method: req.method,
      });

      return;
    }

    // GET /health
    if (req.method === "GET" && pathname === "/health") {
      const uptime = (Date.now() - startTime) / 1000;

      sendJSON(200, {
        status: "ok",
        uptime,
      });

      return;
    }

    // GET /echo
    if (req.method === "GET" && pathname === "/echo") {
      sendJSON(200, req.headers);
      return;
    }

    // GET /status/:code
    if (
      req.method === "GET" &&
      pathname.startsWith("/status/")
    ) {
      const code = Number(pathname.split("/")[2]);

      if (
        !Number.isInteger(code) ||
        code < 100 ||
        code > 599
      ) {
        sendJSON(400, {
          error: "Status code must be between 100 and 599",
        });

        return;
      }

      sendJSON(code, {
        status: code,
        message: `Response with status ${code}`,
      });

      return;
    }

    // POST /body
    if (req.method === "POST" && pathname === "/body") {
      try {
        const body = await readBody();

        sendJSON(200, {
          received: body,
        });
      } catch (err) {
        sendJSON(400, {
          error: err.message,
        });
      }

      return;
    }

    // DELETE /nothing
    if (
      req.method === "DELETE" &&
      pathname === "/nothing"
    ) {
      res.writeHead(204);
      res.end();
      return;
    }

    // GET /error
    if (req.method === "GET" && pathname === "/error") {
      throw new Error("Something went wrong");
    }

    // 404
    sendJSON(404, {
      error: `Cannot ${req.method} ${pathname}`,
    });
  };

  handleRequest().catch(err => {
    console.error("Unhandled error:", err);

    sendJSON(500, {
      error: "Internal Server Error",
    });
  });
});

// ============================================================
// Start server
// ============================================================

server.listen(PORT, () => {
  console.log(
    `HTTP Basics server running on http://localhost:${PORT}`
  );

  console.log("\nEndpoints:");
  console.log("GET    /");
  console.log("GET    /health");
  console.log("GET    /echo");
  console.log("GET    /status/:code");
  console.log("POST   /body");
  console.log("DELETE /nothing");
  console.log("GET    /error");
});

// ============================================================
// 1.3: Phân tích HTTP Request
// ============================================================

/**
 * Request 1:
 * GET /api/products/999
 *
 * -> Client muốn:
 *    Lấy thông tin product có id 999.
 *
 * -> Status nếu tìm thấy:
 *    200 OK
 *
 * -> Status nếu không tìm thấy:
 *    404 Not Found
 *
 *
 * Request 2:
 * POST /api/products
 *
 * { "price": -1000 }
 *
 * -> Client muốn:
 *    Tạo product mới.
 *
 * -> Vấn đề:
 *    price không hợp lệ vì là số âm.
 *
 * -> Status phù hợp:
 *    400 Bad Request
 *
 *
 * Request 3:
 * DELETE /api/products/5
 *
 * -> Client muốn:
 *    Xóa product id 5.
 *
 * -> Status nếu xóa thành công:
 *    204 No Content
 *
 * -> Body cần thiết không:
 *    Không.
 *
 *
 * Request 4:
 * PATCH /api/products/3
 *
 * { "price": 20000000 }
 *
 * -> Khác PUT:
 *    PATCH chỉ cập nhật một phần resource.
 *
 * -> Chỉ update field:
 *    price
 */