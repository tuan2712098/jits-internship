require("dotenv").config();

const {
  connectDB,
  disconnectDB,
  User,
  Post,
} = require("./models");

// ============================================================
// SEED DATA
// ============================================================

async function seedData() {
  await Post.deleteMany({});
  await User.deleteMany({});

  const alice = await User.create({
    name: "Alice Nguyen",
    email: "alice@example.com",
    password: "Password123",
    role: "admin",
    bio: "Full-stack developer, coffee lover",
  });

  const bob = await User.create({
    name: "Bob Tran",
    email: "bob@example.com",
    password: "Password456",
    role: "user",
    bio: "Backend engineer",
  });

  const carol = await User.create({
    name: "Carol Le",
    email: "carol@example.com",
    password: "Password789",
    role: "user",
  });

  await Post.create([
    {
      title: "Getting Started with Node.js",
      content:
        "Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows you to run JavaScript on the server side...",
      author: alice._id,
      tags: [
        "nodejs",
        "javascript",
        "backend",
      ],
      published: true,
    },

    {
      title:
        "Understanding Async/Await in JavaScript",
      content:
        "Async/await is syntactic sugar on top of Promises. It makes asynchronous code look and behave more like synchronous code...",
      author: alice._id,
      tags: [
        "javascript",
        "async",
        "promises",
      ],
      published: true,
    },

    {
      title:
        "MongoDB vs PostgreSQL: When to Choose Which",
      content:
        "Both MongoDB and PostgreSQL are excellent databases. The choice depends on your data structure, query patterns, and team expertise...",
      author: bob._id,
      tags: [
        "database",
        "mongodb",
        "postgresql",
      ],
      published: true,
    },

    {
      title:
        "Draft: REST API Best Practices",
      content:
        "This is a draft post about REST API design. Will cover versioning, error handling, pagination...",
      author: bob._id,
      tags: [
        "api",
        "rest",
        "backend",
      ],
      published: false,
    },

    {
      title:
        "Introduction to Express Middleware",
      content:
        "Middleware functions in Express are functions that have access to the request object, response object, and next function...",
      author: carol._id,
      tags: [
        "expressjs",
        "middleware",
        "nodejs",
      ],
      published: true,
    },
  ]);

  console.log(
    "Seeded: 3 users, 5 posts"
  );

  return {
    alice,
    bob,
    carol,
  };
}

// ============================================================
// TODO 3.1
// ============================================================

async function createPostWithReference() {
  console.log(
    "\n--- TODO 3.1: Create post with reference ---"
  );

  const dave =
    await User.create({
      name: "Dave Pham",
      email: "dave@example.com",
      password: "Password999",
      role: "user",
      bio: "Node.js developer",
    });

  const post =
    await Post.create({
      title:
        "Learning Mongoose Populate",
      content:
        "Mongoose populate allows us to load referenced documents from another MongoDB collection.",
      author: dave._id,
      tags: [
        "mongodb",
        "mongoose",
        "populate",
      ],
      published: true,
    });

  console.log(
    "Before populate:"
  );

  console.log(
    "author:",
    post.author
  );

  console.log(
    "Is ObjectId:",
    post.author instanceof
      require("mongoose").Types.ObjectId
  );

  await post.populate(
    "author"
  );

  console.log(
    "After populate:"
  );

  console.log(
    "author name:",
    post.author.name
  );

  console.log(
    "author email:",
    post.author.email
  );

  return post;
}

// ============================================================
// TODO 3.2
// ============================================================

async function getAllPostsWithAuthor() {
  console.log(
    "\n--- TODO 3.2: Get all posts with author populated ---"
  );

  const posts =
    await Post.find()
      .populate("author")
      .lean();

  posts.forEach(post => {
    const status =
      post.published
        ? "published"
        : "draft";

    console.log(
      `[${status}] ${post.title} by ${post.author.name}`
    );

    console.log(
      `  email: ${post.author.email}`
    );
  });

  return posts;
}

// ============================================================
// TODO 3.3
// ============================================================

async function getPostsSelectivePopulate() {
  console.log(
    "\n--- TODO 3.3: Populate with field selection ---"
  );

  const posts =
    await Post.find()
      .select(
        "title published author"
      )
      .populate({
        path: "author",
        select:
          "name email -_id",
      })
      .lean();

  posts.forEach(post => {
    console.log({
      title: post.title,
      published:
        post.published,
      author: post.author,
    });

    console.log(
      "password exists:",
      post.author.password !==
        undefined
    );

    console.log(
      "role exists:",
      post.author.role !==
        undefined
    );
  });

  return posts;
}

// ============================================================
// TODO 3.4
// ============================================================

async function getPostsByUser(
  userId
) {
  console.log(
    `\n--- TODO 3.4: Get posts by user ${userId} ---`
  );

  const posts =
    await Post.find({
      author: userId,
      published: true,
    })
      .sort({
        createdAt: -1,
      })
      .populate(
        "author",
        "name"
      )
      .lean();

  const authorName =
    posts.length > 0
      ? posts[0].author.name
      : "User";

  console.log(
    `${authorName} has ${posts.length} published posts:`
  );

  posts.forEach(post => {
    console.log(
      `  - ${post.title} (tags: ${post.tags.join(", ")})`
    );
  });

  return posts;
}

// ============================================================
// TODO 3.5
// ============================================================

async function getPublishedPosts() {
  console.log(
    "\n--- TODO 3.5: Get published posts with author info ---"
  );

  const posts =
    await Post.find({
      published: true,
    })
      .sort({
        createdAt: -1,
      })
      .select(
        "title tags author createdAt"
      )
      .populate({
        path: "author",
        select:
          "name email bio",
      })
      .lean();

  console.log(
    `Published posts: ${posts.length}`
  );

  posts.forEach(post => {
    console.log(
      `- ${post.title}`
    );

    console.log(
      `  Author: ${post.author.name}`
    );

    console.log(
      `  Email: ${post.author.email}`
    );

    console.log(
      `  Bio: ${post.author.bio}`
    );

    console.log(
      `  Tags: ${post.tags.join(", ")}`
    );
  });

  return posts;
}

// ============================================================
// TODO 3.6
// ============================================================

async function demonstrateVirtuals() {
  console.log(
    "\n--- TODO 3.6: Virtual fields ---"
  );

  const post =
    await Post.findOne({
      published: true,
    }).populate("author");

  if (!post) {
    console.log(
      "No published post found"
    );

    return null;
  }

  console.log(
    "Post:",
    post.title
  );

  console.log(
    "Snippet:",
    post.snippet
  );

  console.log(
    "Author:",
    post.author.name
  );

  console.log(
    "Display name:",
    post.author.displayName
  );

  /**
   * Q1:
   * populate() gần giống JOIN trong SQL.
   * Mongoose thường cần query document chính rồi query
   * collection được reference để lấy dữ liệu liên quan.
   *
   * Q2:
   * Embed khi dữ liệu con nhỏ, ít thay đổi và luôn được
   * đọc cùng document cha.
   *
   * Reference khi dữ liệu lớn, được dùng lại ở nhiều nơi
   * hoặc cần query/update độc lập.
   *
   * Ví dụ:
   * - vài comment nhỏ: có thể embed
   * - hệ thống có rất nhiều comments: nên reference
   *
   * Q3:
   * populate() có thể tốn thêm query, network và memory.
   *
   * Cách giảm:
   * - chỉ populate khi cần
   * - select đúng field cần dùng
   * - index field reference
   * - pagination
   * - dùng aggregation khi phù hợp
   */

  return post;
}

// ============================================================
// MAIN
// ============================================================

async function run() {
  console.log(
    "=".repeat(50)
  );

  console.log(
    "Day 4 - Exercise 03: Populate"
  );

  console.log(
    "=".repeat(50)
  );

  await connectDB();

  const {
    alice,
  } = await seedData();

  await createPostWithReference();

  await getAllPostsWithAuthor();

  await getPostsSelectivePopulate();

  await getPostsByUser(
    alice._id
  );

  await getPublishedPosts();

  await demonstrateVirtuals();

  console.log(
    "\nAll done."
  );

  await disconnectDB();
}

run().catch(err => {
  console.error(
    "Error:",
    err.message
  );

  process.exit(1);
});