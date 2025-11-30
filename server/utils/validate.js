// utils/validate.js
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const medSchema = Joi.object({
  name: Joi.string().trim().required(),
  dosage: Joi.string().trim().optional(),
  schedule: Joi.object({
    morning: Joi.boolean().default(false),
    afternoon: Joi.boolean().default(false),
    evening: Joi.boolean().default(false),
    night: Joi.boolean().default(false)
  }).default({})
});

module.exports = {
  validateRegister: (data) => registerSchema.validate(data),
  validateLogin: (data) => loginSchema.validate(data),
  validateMed: (data) => medSchema.validate(data)
};