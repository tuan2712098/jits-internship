const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },

    content: {
      type: String,
      required: true,
      minlength: 10,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    published: {
      type: Boolean,
      default: false,
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("snippet").get(function () {
  if (
    this.content &&
    this.content.length > 100
  ) {
    return (
      this.content.substring(0, 100) +
      "..."
    );
  }

  return this.content;
});

postSchema.index({
  author: 1,
  createdAt: -1,
});

postSchema.index({
  published: 1,
  createdAt: -1,
});

module.exports =
  mongoose.model("Post", postSchema);