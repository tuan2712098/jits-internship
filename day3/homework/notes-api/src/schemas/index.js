const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  email: Joi.string()
    .email()
    .lowercase()
    .required(),

  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[A-Z])(?=.*\d).+$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter and one number",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required(),

  password: Joi.string()
    .required(),
});

const createNoteSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required(),

  content: Joi.string()
    .max(10000)
    .default(""),

  tags: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(30)
    )
    .default([]),
});

const updateNoteSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200),

  content: Joi.string()
    .max(10000),

  tags: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(30)
    ),
}).min(1);

const noteQuerySchema = Joi.object({
  tag: Joi.string()
    .trim()
    .max(30),

  q: Joi.string()
    .trim()
    .max(100),
});

module.exports = {
  registerSchema,
  loginSchema,
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
};