const Joi = require("joi");

const createTodoSchema =
  Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required(),

    priority: Joi.string()
      .valid(
        "low",
        "medium",
        "high"
      )
      .default("medium"),
  });

const updateTodoSchema =
  Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(200),

    priority: Joi.string()
      .valid(
        "low",
        "medium",
        "high"
      ),

    completed:
      Joi.boolean(),
  }).min(1);

const todoQuerySchema =
  Joi.object({
    status: Joi.string()
      .valid(
        "all",
        "active",
        "completed"
      )
      .default("all"),

    priority:
      Joi.string().valid(
        "low",
        "medium",
        "high"
      ),

    search: Joi.string()
      .max(100),

    sort: Joi.string()
      .valid(
        "createdAt",
        "priority",
        "title"
      )
      .default("createdAt"),

    order: Joi.string()
      .valid(
        "asc",
        "desc"
      )
      .default("asc"),
  });

module.exports = {
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema,
};