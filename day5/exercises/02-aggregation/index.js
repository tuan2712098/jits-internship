/**
 * Day 5 - Exercise 02: Aggregation Pipeline
 *
 * Mục tiêu:
 * - $match, $group, $project, $sort, $limit
 * - $lookup
 * - $unwind
 * - Aggregation statistics
 */

"use strict";

require("dotenv").config();

const mongoose = require("mongoose");

// ============================================================
// Models
// ============================================================

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true,
  },

  role: {
    type: String,
    enum: ["author", "reader"],
    default: "reader",
  },
});

const postSchema = new mongoose.Schema(
  {
    title: String,

    content: String,

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    category: {
      type: String,
      enum: [
        "tech",
        "lifestyle",
        "travel",
        "food",
        "business",
      ],
    },

    tags: [String],

    viewCount: {
      type: Number,
      default: 0,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isPublished: {
      type: Boolean,
      default: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    content: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

const Post = mongoose.model(
  "Post",
  postSchema
);

const Comment = mongoose.model(
  "Comment",
  commentSchema
);

// ============================================================
// Seed Data
// ============================================================

async function seedData() {
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});

  const users = await User.insertMany([
    {
      name: "Alice Nguyen",
      email: "alice@example.com",
      role: "author",
    },
    {
      name: "Bob Tran",
      email: "bob@example.com",
      role: "author",
    },
    {
      name: "Carol Le",
      email: "carol@example.com",
      role: "author",
    },
    {
      name: "Dave Pham",
      email: "dave@example.com",
      role: "reader",
    },
    {
      name: "Eve Hoang",
      email: "eve@example.com",
      role: "reader",
    },
  ]);

  const [
    alice,
    bob,
    carol,
    dave,
    eve,
  ] = users;

  const posts = await Post.insertMany([
    {
      title: "Getting Started with Node.js",
      author: alice._id,
      category: "tech",
      tags: [
        "nodejs",
        "javascript",
        "backend",
      ],
      viewCount: 1500,
      likes: [
        dave._id,
        eve._id,
        bob._id,
      ],
      publishedAt: new Date(),
    },

    {
      title:
        "MongoDB Aggregation Deep Dive",
      author: alice._id,
      category: "tech",
      tags: [
        "mongodb",
        "database",
        "aggregation",
      ],
      viewCount: 2200,
      likes: [
        dave._id,
        eve._id,
      ],
      publishedAt: new Date(),
    },

    {
      title:
        "Top 10 Coffee Shops in Hanoi",
      author: bob._id,
      category: "lifestyle",
      tags: [
        "coffee",
        "hanoi",
        "lifestyle",
      ],
      viewCount: 800,
      likes: [
        alice._id,
        carol._id,
        dave._id,
        eve._id,
      ],
      publishedAt: new Date(),
    },

    {
      title:
        "Backpacking Da Nang on a Budget",
      author: bob._id,
      category: "travel",
      tags: [
        "travel",
        "danang",
        "budget",
      ],
      viewCount: 3100,
      likes: [
        alice._id,
      ],
      publishedAt: new Date(),
    },

    {
      title:
        "Pho Recipe: The Authentic Way",
      author: carol._id,
      category: "food",
      tags: [
        "food",
        "vietnamese",
        "recipe",
        "pho",
      ],
      viewCount: 560,
      likes: [
        dave._id,
      ],
      publishedAt: new Date(),
    },

    {
      title:
        "Building Your First REST API",
      author: carol._id,
      category: "tech",
      tags: [
        "api",
        "rest",
        "nodejs",
        "backend",
      ],
      viewCount: 1800,
      likes: [
        alice._id,
        bob._id,
        dave._id,
        eve._id,
      ],
      publishedAt: new Date(),
    },

    {
      title:
        "Startup Lessons from 2 Years of Failure",
      author: alice._id,
      category: "business",
      tags: [
        "startup",
        "business",
        "lessons",
      ],
      viewCount: 4500,
      likes: [
        bob._id,
        carol._id,
        dave._id,
        eve._id,
      ],

      // Cũ hơn 30 ngày
      publishedAt: new Date(
        Date.now() -
          35 *
            24 *
            60 *
            60 *
            1000
      ),
    },
  ]);

  const [
    post1,
    post2,
    post3,
    post4,
    post5,
    post6,
  ] = posts;

  await Comment.insertMany([
    {
      post: post1._id,
      author: dave._id,
      content: "Great intro!",
    },

    {
      post: post1._id,
      author: eve._id,
      content:
        "Very helpful, thanks!",
    },

    {
      post: post1._id,
      author: bob._id,
      content: "Bookmarked.",
    },

    {
      post: post2._id,
      author: dave._id,
      content: "Mind blown.",
    },

    {
      post: post2._id,
      author: carol._id,
      content:
        "Using this at work now.",
    },

    {
      post: post3._id,
      author: alice._id,
      content:
        "Trying Hanoi next month!",
    },

    {
      post: post4._id,
      author: eve._id,
      content:
        "Done this trip, 10/10",
    },

    {
      post: post4._id,
      author: carol._id,
      content:
        "Added to my bucket list",
    },

    {
      post: post5._id,
      author: dave._id,
      content:
        "Making this tomorrow",
    },

    {
      post: post6._id,
      author: alice._id,
      content:
        "Clean example!",
    },

    {
      post: post6._id,
      author: bob._id,
      content:
        "Sharing with my team",
    },

    {
      post: post6._id,
      author: eve._id,
      content:
        "Step by step, love it",
    },
  ]);

  console.log(
    "Seed data inserted:"
  );

  console.log(
    `  Users: ${users.length}`
  );

  console.log(
    `  Posts: ${posts.length}`
  );

  console.log(
    "  Comments: 12"
  );

  console.log();

  return {
    users,
    posts,
  };
}

// ============================================================
// 2.1: Count posts by category
// ============================================================

async function postsByCategory() {
  const result =
    await Post.aggregate([
      {
        $group: {
          _id: "$category",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },

      {
        $project: {
          _id: 0,

          category: "$_id",

          count: 1,
        },
      },
    ]);

  console.log(
    "=== 2.1: Posts by Category ==="
  );

  console.log(result);

  console.log();

  return result;
}

// ============================================================
// 2.2: Average viewCount by category
// ============================================================

async function avgViewsByCategory() {
  const result =
    await Post.aggregate([
      {
        $group: {
          _id: "$category",

          avgViews: {
            $avg: "$viewCount",
          },
        },
      },

      {
        $sort: {
          avgViews: -1,
        },
      },

      {
        $project: {
          _id: 0,

          category: "$_id",

          avgViews: {
            $round: [
              "$avgViews",
              0,
            ],
          },
        },
      },
    ]);

  console.log(
    "=== 2.2: Average Views by Category ==="
  );

  console.log(result);

  console.log();

  return result;
}

// ============================================================
// 2.3: $lookup posts với authors
// ============================================================

async function postsWithAuthors() {
  const result =
    await Post.aggregate([
      {
        $lookup: {
          from: "users",

          localField:
            "author",

          foreignField:
            "_id",

          as: "authorInfo",
        },
      },

      {
        $unwind:
          "$authorInfo",
      },

      {
        $project: {
          _id: 0,

          title: 1,

          category: 1,

          viewCount: 1,

          author: {
            name:
              "$authorInfo.name",

            email:
              "$authorInfo.email",
          },
        },
      },
    ]);

  console.log(
    "=== 2.3: Posts with Author Info ($lookup) ==="
  );

  result.forEach(
    (p) =>
      console.log(
        `  "${p.title}" by ${p.author?.name} (${p.author?.email})`
      )
  );

  console.log();

  return result;
}

// ============================================================
// 2.4: Top 5 tags
// ============================================================

async function topTags() {
  const result =
    await Post.aggregate([
      {
        $unwind: "$tags",
      },

      {
        $group: {
          _id: "$tags",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },

      {
        $limit: 5,
      },

      {
        $project: {
          _id: 0,

          tag: "$_id",

          count: 1,
        },
      },
    ]);

  console.log(
    "=== 2.4: Top 5 Tags ==="
  );

  console.log(result);

  console.log();

  return result;
}

// ============================================================
// 2.5: Top 3 posts nhiều likes trong 30 ngày
// ============================================================

async function topPostsByLikes() {
  const thirtyDaysAgo =
    new Date();

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() -
      30
  );

  const result =
    await Post.aggregate([
      {
        $match: {
          publishedAt: {
            $gte:
              thirtyDaysAgo,
          },
        },
      },

      {
        $addFields: {
          likeCount: {
            $size: "$likes",
          },
        },
      },

      {
        $sort: {
          likeCount: -1,
        },
      },

      {
        $limit: 3,
      },

      {
        $project: {
          _id: 0,

          title: 1,

          category: 1,

          likeCount: 1,

          publishedAt: 1,
        },
      },
    ]);

  console.log(
    "=== 2.5: Top 3 Posts by Likes (last 30 days) ==="
  );

  result.forEach(
    (p) =>
      console.log(
        `  "${p.title}" — ${p.likeCount} likes (${p.category})`
      )
  );

  console.log();

  return result;
}

// ============================================================
// 2.6: User statistics
// ============================================================

async function userStats() {
  // ----------------------------------------------------------
  // Step 1: Post statistics
  // ----------------------------------------------------------

  const postStats =
    await Post.aggregate([
      {
        $group: {
          _id: "$author",

          postCount: {
            $sum: 1,
          },

          totalViews: {
            $sum:
              "$viewCount",
          },
        },
      },

      {
        $lookup: {
          from: "users",

          localField: "_id",

          foreignField:
            "_id",

          as: "user",
        },
      },

      {
        $unwind:
          "$user",
      },

      {
        $project: {
          _id: 1,

          author:
            "$user.name",

          postCount: 1,

          totalViews: 1,
        },
      },
    ]);

  // ----------------------------------------------------------
  // Step 2: Comment statistics
  // ----------------------------------------------------------

  const commentStats =
    await Comment.aggregate([
      {
        $lookup: {
          from: "posts",

          localField: "post",

          foreignField:
            "_id",

          as: "postInfo",
        },
      },

      {
        $unwind:
          "$postInfo",
      },

      {
        $group: {
          _id:
            "$postInfo.author",

          commentCount: {
            $sum: 1,
          },
        },
      },
    ]);

  // ----------------------------------------------------------
  // Step 3: Merge trong JS
  // ----------------------------------------------------------

  const commentMap =
    new Map(
      commentStats.map(
        (item) => [
          item._id.toString(),
          item.commentCount,
        ]
      )
    );

  const merged =
    postStats
      .map((item) => ({
        author:
          item.author,

        postCount:
          item.postCount,

        totalViews:
          item.totalViews,

        commentCount:
          commentMap.get(
            item._id.toString()
          ) || 0,
      }))
      .sort(
        (a, b) =>
          b.totalViews -
          a.totalViews
      );

  console.log(
    "=== 2.6: User Statistics ==="
  );

  console.log(merged);

  console.log();

  return merged;
}

// ============================================================
// Main
// ============================================================

async function main() {
  try {
    if (
      !process.env
        .MONGODB_URI
    ) {
      throw new Error(
        "MONGODB_URI is missing from .env"
      );
    }

    await mongoose.connect(
      process.env
        .MONGODB_URI
    );

    console.log(
      "Connected to MongoDB\n"
    );

    await seedData();

    await postsByCategory();

    await avgViewsByCategory();

    await postsWithAuthors();

    await topTags();

    await topPostsByLikes();

    await userStats();
  } catch (err) {
    console.error(
      "Error:",
      err
    );
  } finally {
    await mongoose.disconnect();

    console.log(
      "Disconnected from MongoDB"
    );
  }
}

main();

// ============================================================
// CÂU HỎI TƯ DUY
// ============================================================

/**
 * Q1:
 *
 * Dùng populate() khi:
 * - Chỉ cần lấy document liên quan đơn giản.
 * - Ví dụ lấy Post kèm thông tin User.
 *
 * Dùng aggregate() khi:
 * - Cần group, count, sum, average, sort, lookup,
 *   thống kê hoặc xử lý dữ liệu phức tạp.
 */

/**
 * Q2:
 *
 * $match nên đặt đầu pipeline vì nó lọc bớt documents
 * trước khi chạy các stage tiếp theo.
 *
 * Nhờ vậy MongoDB phải xử lý ít dữ liệu hơn và có thể
 * tận dụng index để tăng hiệu năng.
 */

/**
 * Q3:
 *
 * $lookup trả kết quả dưới dạng array.
 *
 * $unwind biến mỗi phần tử trong array thành một document,
 * giúp dễ truy cập dữ liệu của object được join.
 *
 * Không cần $unwind khi muốn giữ kết quả lookup dưới dạng array
 * hoặc quan hệ có nhiều document.
 */

/**
 * Q4:
 *
 * Nếu cần top 10 posts mới nhất kèm author name và
 * comment count thì aggregate phù hợp hơn.
 *
 * Vì có thể:
 * - sort
 * - limit
 * - lookup author
 * - lookup comments
 * - count comments
 *
 * trong một aggregation pipeline thay vì lấy dữ liệu rồi
 * xử lý nhiều bước bằng JavaScript.
 */