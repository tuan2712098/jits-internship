const express = require("express");

const app = express();
const PORT = 3002;

app.use(express.json());

// ============================================================
// 2.1: Route cơ bản
// ============================================================

// GET /ping
app.get("/ping", (req, res) => {
  res.status(200).json({
    message: "pong",
    timestamp: new Date().toISOString(),
  });
});

// GET /hello/:name
app.get("/hello/:name", (req, res) => {
  const { name } = req.params;

  if (name.toLowerCase() === "error") {
    return res.status(400).json({
      error: "Name cannot be 'error'",
    });
  }

  res.status(200).json({
    message: `Hello, ${name}!`,
  });
});

// GET /math/add?a=5&b=3
app.get("/math/add", (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({
      error: "a and b must be valid numbers",
    });
  }

  res.status(200).json({
    result: a + b,
    operation: "add",
  });
});

// POST /echo
app.post("/echo", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Request body is required",
    });
  }

  res.status(200).json({
    ...req.body,
    receivedAt: new Date(),
  });
});

// ============================================================
// 2.2: Route Params nâng cao
// ============================================================

// GET /users/:userId/posts/:postId
app.get("/users/:userId/posts/:postId", (req, res) => {
  const userId = Number(req.params.userId);
  const postId = Number(req.params.postId);

  if (
    !Number.isInteger(userId) ||
    !Number.isInteger(postId) ||
    userId <= 0 ||
    postId <= 0
  ) {
    return res.status(400).json({
      error: "userId and postId must be positive integers",
    });
  }

  res.status(200).json({
    userId,
    postId,
    message: `Fetching post ${postId} of user ${userId}`,
  });
});

// GET /files/*
app.get("/files/*", (req, res) => {
  const filePath = req.params[0];

  res.status(200).json({
    path: filePath,
    segments: filePath.split("/"),
  });
});

// ============================================================
// 2.3: Query String nâng cao
// ============================================================

const books = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert Martin",
    genre: "tech",
    year: 2008,
    price: 350000,
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    genre: "tech",
    year: 1999,
    price: 420000,
  },
  {
    id: 3,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "history",
    year: 2011,
    price: 280000,
  },
  {
    id: 4,
    title: "Atomic Habits",
    author: "James Clear",
    genre: "self-help",
    year: 2018,
    price: 230000,
  },
  {
    id: 5,
    title: "Dune",
    author: "Frank Herbert",
    genre: "fiction",
    year: 1965,
    price: 190000,
  },
];

function filterBooks(query) {
  const {
    genre,
    minPrice,
    maxPrice,
    sort,
    order = "asc",
    search,
  } = query;

  let result = [...books];

  if (genre) {
    result = result.filter(book => book.genre === genre);
  }

  if (minPrice) {
    result = result.filter(
      book => book.price >= Number(minPrice)
    );
  }

  if (maxPrice) {
    result = result.filter(
      book => book.price <= Number(maxPrice)
    );
  }

  if (search) {
    const keyword = search.toLowerCase();

    result = result.filter(book =>
      book.title.toLowerCase().includes(keyword)
    );
  }

  if (sort && ["title", "year", "price"].includes(sort)) {
    result.sort((a, b) => {
      let comparison = 0;

      if (typeof a[sort] === "string") {
        comparison = a[sort].localeCompare(b[sort]);
      } else {
        comparison = a[sort] - b[sort];
      }

      return order === "desc"
        ? -comparison
        : comparison;
    });
  }

  return result;
}

// GET /books
app.get("/books", (req, res) => {
  const result = filterBooks(req.query);

  res.status(200).json({
    data: result,
    total: result.length,
    filters: req.query,
  });
});

// ============================================================
// 2.4: Request Headers
// ============================================================

// GET /headers/info
app.get("/headers/info", (req, res) => {
  res.status(200).json({
    userAgent: req.headers["user-agent"],
    acceptLanguage:
      req.headers["accept-language"],
    customHeader:
      req.headers["x-custom-header"] || null,
    allHeaders: req.headers,
  });
});

// GET /headers/accept
app.get("/headers/accept", (req, res) => {
  const accept = req.get("Accept") || "";

  if (accept.includes("application/json")) {
    return res.json({
      data: "JSON response",
    });
  }

  if (accept.includes("text/plain")) {
    return res
      .type("text")
      .send("Plain text response");
  }

  res.status(406).json({
    error: "Not Acceptable",
  });
});

// POST /headers/auth
app.post("/headers/auth", (req, res) => {
  const key = req.get("X-API-Key");

  if (!key) {
    return res.status(401).json({
      error: "Missing X-API-Key header",
    });
  }

  if (key !== "secret123") {
    return res.status(401).json({
      error: "Invalid API key",
    });
  }

  res.status(200).json({
    message: "Authenticated!",
    key,
  });
});

// ============================================================
// 2.5: express.Router()
// ============================================================

const booksRouter = express.Router();
const usersRouter = express.Router();

const users = [
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
  },
];

// -----------------------
// Books Router
// -----------------------

booksRouter.get("/", (req, res) => {
  const result = filterBooks(req.query);

  res.json({
    data: result,
    total: result.length,
  });
});

booksRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  const book = books.find(book => book.id === id);

  if (!book) {
    return res.status(404).json({
      error: "Book not found",
    });
  }

  res.json(book);
});

booksRouter.post("/", (req, res) => {
  const {
    title,
    author,
    genre,
    year,
    price,
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      error: "title and author are required",
    });
  }

  const newBook = {
    id:
      books.length > 0
        ? Math.max(...books.map(book => book.id)) + 1
        : 1,
    title,
    author,
    genre,
    year,
    price,
  };

  books.push(newBook);

  res.status(201).json(newBook);
});

booksRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = books.findIndex(
    book => book.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Book not found",
    });
  }

  books.splice(index, 1);

  res.status(204).send();
});

// -----------------------
// Users Router
// -----------------------

usersRouter.get("/", (req, res) => {
  res.json(users);
});

usersRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  const user = users.find(user => user.id === id);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.json(user);
});

usersRouter.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: "name and email are required",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      error: "Invalid email",
    });
  }

  const newUser = {
    id:
      users.length > 0
        ? Math.max(...users.map(user => user.id)) + 1
        : 1,
    name,
    email,
  };

  users.push(newUser);

  res.status(201).json(newUser);
});

// Mount routers
app.use("/api/v2/books", booksRouter);
app.use("/api/v2/users", usersRouter);

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.path}`,
  });
});

// ============================================================
// Error handler
// ============================================================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    error:
      err.message ||
      "Internal Server Error",
  });
});

// ============================================================
// Start
// ============================================================

app.listen(PORT, () => {
  console.log(
    `Express Routing server running on http://localhost:${PORT}`
  );
});