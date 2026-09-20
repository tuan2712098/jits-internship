/**
 * Day 4 - Bài 2: Querying nâng cao với Mongoose
 */

const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const mongoose = require("mongoose");

// ============================================================
// SCHEMA & MODEL
// ============================================================

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      required: true,
      enum: {
        values: [
          "tech",
          "furniture",
          "clothing",
          "food",
          "sports",
        ],
        message: "{VALUE} is not a valid category",
      },
    },

    tags: [String],

    inStock: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = mongoose.model(
  "Product",
  productSchema
);

// ============================================================
// SEED DATA
// ============================================================

const seedProducts = [
  {
    name: "iPhone 15 Pro",
    price: 999,
    category: "tech",
    tags: ["apple", "smartphone", "new"],
    inStock: true,
    rating: 4.8,
  },
  {
    name: "Samsung Galaxy S24",
    price: 799,
    category: "tech",
    tags: ["samsung", "smartphone"],
    inStock: true,
    rating: 4.6,
  },
  {
    name: "MacBook Air M3",
    price: 1299,
    category: "tech",
    tags: ["apple", "laptop", "new"],
    inStock: false,
    rating: 4.9,
  },
  {
    name: "Office Chair Pro",
    price: 350,
    category: "furniture",
    tags: ["ergonomic", "office"],
    inStock: true,
    rating: 4.3,
  },
  {
    name: "Standing Desk",
    price: 650,
    category: "furniture",
    tags: ["office", "adjustable"],
    inStock: true,
    rating: 4.5,
  },
  {
    name: "Nike Running Shoes",
    price: 120,
    category: "sports",
    tags: ["nike", "running", "sale"],
    inStock: true,
    rating: 4.4,
  },
  {
    name: "Adidas Hoodie",
    price: 85,
    category: "clothing",
    tags: ["adidas", "casual", "sale"],
    inStock: true,
    rating: 4.2,
  },
  {
    name: "Instant Noodles Pack",
    price: 5,
    category: "food",
    tags: ["instant", "budget"],
    inStock: true,
    rating: 3.8,
  },
  {
    name: "Protein Powder 2kg",
    price: 65,
    category: "sports",
    tags: ["nutrition", "fitness"],
    inStock: false,
    rating: 4.1,
  },
  {
    name: "Gaming Keyboard",
    price: 180,
    category: "tech",
    tags: ["gaming", "mechanical"],
    inStock: true,
    rating: 4.7,
  },
];

async function seedDatabase() {
  await Product.deleteMany({});
  await Product.insertMany(seedProducts);

  console.log(
    `Seeded ${seedProducts.length} products`
  );
}

// ============================================================
// TODO 2.1 - Filter category
// ============================================================

async function filterByCategory(category) {
  console.log(
    `\nProducts in category: "${category}"`
  );

  const products =
    await Product.find({
      category,
    }).lean();

  console.log(
    `Found ${products.length} products`
  );

  products.forEach(product => {
    console.log(
      `- ${product.name}`
    );
  });

  return products;
}

// ============================================================
// TODO 2.2 - Price range
// ============================================================

async function filterByPriceRange(
  minPrice,
  maxPrice
) {
  console.log(
    `\nProducts priced $${minPrice} - $${maxPrice}:`
  );

  const products =
    await Product.find({
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    })
      .sort({
        price: 1,
      })
      .lean();

  products.forEach(product => {
    console.log(
      `${product.name}: $${product.price}`
    );
  });

  return products;
}

// ============================================================
// TODO 2.3 - Regex search
// ============================================================

async function searchByName(keyword) {
  console.log(
    `\nSearch results for: "${keyword}"`
  );

  const products =
    await Product.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    }).lean();

  console.log(
    `Found ${products.length} results`
  );

  products.forEach(product => {
    console.log(
      `- ${product.name}`
    );
  });

  return products;
}

// ============================================================
// TODO 2.4 - $in
// ============================================================

async function filterByCategories(
  categories
) {
  console.log(
    `\nProducts in categories: ${categories.join(", ")}`
  );

  const products =
    await Product.find({
      category: {
        $in: categories,
      },
    })
      .sort({
        category: 1,
        name: 1,
      })
      .lean();

  let currentCategory = null;

  products.forEach(product => {
    if (
      product.category !==
      currentCategory
    ) {
      currentCategory =
        product.category;

      console.log(
        `\n[${currentCategory}]`
      );
    }

    console.log(
      `- ${product.name}`
    );
  });

  return products;
}

// ============================================================
// TODO 2.5 - Pagination
// ============================================================

async function getProductsPaginated({
  page = 1,
  limit = 3,
  sort = "-createdAt",
  filter = {},
} = {}) {
  const skip =
    (page - 1) * limit;

  const [data, total] =
    await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(
        filter
      ),
    ]);

  const totalPages =
    Math.ceil(total / limit);

  return {
    data,

    pagination: {
      page,
      limit,
      total,
      totalPages,

      hasNext:
        page < totalPages,

      hasPrev:
        page > 1,
    },
  };
}

// ============================================================
// TODO 2.6 - Select fields
// ============================================================

async function getProductsMinimal() {
  console.log(
    "\nProducts (name, price, category only):"
  );

  const products =
    await Product.find()
      .select(
        "name price category -_id"
      )
      .lean();

  products.forEach(product => {
    console.log(product);
  });

  return products;
}

// ============================================================
// TODO 2.7 - lean comparison
// ============================================================

async function compareLean() {
  console.log(
    "\n--- .lean() comparison ---"
  );

  const withLean =
    await Product.findOne().lean();

  const withoutLean =
    await Product.findOne();

  console.log(
    "With lean - constructor:",
    withLean.constructor.name
  );

  console.log(
    "Without lean - constructor:",
    withoutLean.constructor.name
  );

  console.log(
    "With lean has save():",
    typeof withLean.save ===
      "function"
  );

  console.log(
    "Without lean has save():",
    typeof withoutLean.save ===
      "function"
  );

  // Test save()
  try {
    await withLean.save();
  } catch {
    console.log(
      "Lean object cannot call .save()"
    );
  }

  await withoutLean.save();

  console.log(
    "Mongoose document can call .save()"
  );

  // Benchmark
  console.time(
    "without lean"
  );

  await Product.find();

  console.timeEnd(
    "without lean"
  );

  console.time(
    "with lean"
  );

  await Product.find().lean();

  console.timeEnd(
    "with lean"
  );
}

// ============================================================
// TODO 2.8 - Aggregate
// ============================================================

async function getCategoryStats() {
  console.log(
    "\nCategory Statistics:"
  );

  const stats =
    await Product.aggregate([
      {
        $group: {
          _id: "$category",

          count: {
            $sum: 1,
          },

          avgPrice: {
            $avg: "$price",
          },

          maxPrice: {
            $max: "$price",
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

  stats.forEach(stat => {
    console.log(
      `Category: ${stat._id.padEnd(10)} | ` +
      `count: ${stat.count} | ` +
      `avgPrice: $${stat.avgPrice.toFixed(2)} | ` +
      `maxPrice: $${stat.maxPrice}`
    );
  });

  return stats;
}

/**
 * Câu hỏi:
 *
 * 1. aggregate() có cần .lean() không?
 * Không.
 * aggregate() đã trả về plain JavaScript objects.
 *
 * 2. Khi nào dùng select()?
 * Khi API list chỉ cần một số field để giảm data trả về
 * và giảm memory/network.
 *
 * 3. Khi nào dùng lean()?
 * Khi chỉ đọc dữ liệu, không cần gọi .save()
 * hoặc các document methods.
 */

// ============================================================
// CONNECT & RUN
// ============================================================

async function connectDB() {
  await mongoose.connect(
    process.env.MONGO_URI
  );

  console.log(
    "MongoDB connected:",
    mongoose.connection.host
  );
}

async function run() {
  console.log(
    "=".repeat(50)
  );

  console.log(
    "Day 4 - Exercise 02: Advanced Queries"
  );

  console.log(
    "=".repeat(50)
  );

  await connectDB();

  await seedDatabase();

  await filterByCategory(
    "tech"
  );

  await filterByPriceRange(
    100,
    800
  );

  await searchByName(
    "pro"
  );

  await filterByCategories([
    "sports",
    "clothing",
  ]);

  console.log(
    "\n--- TODO 2.5: Pagination ---"
  );

  const page1 =
    await getProductsPaginated({
      page: 1,
      limit: 3,
      sort: "-price",
    });

  console.log(
    "Page 1 of",
    page1.pagination.totalPages
  );

  page1.data.forEach(product => {
    console.log(
      ` - ${product.name}: $${product.price}`
    );
  });

  console.log(
    "Pagination info:",
    page1.pagination
  );

  const page2 =
    await getProductsPaginated({
      page: 2,
      limit: 3,
      sort: "-price",
    });

  console.log(
    "\nPage 2:"
  );

  page2.data.forEach(product => {
    console.log(
      ` - ${product.name}: $${product.price}`
    );
  });

  await getProductsMinimal();

  await compareLean();

  await getCategoryStats();

  console.log(
    "\nAll done."
  );

  await mongoose.connection.close();
}

run().catch(err => {
  console.error(
    "Error:",
    err.message
  );

  process.exit(1);
});