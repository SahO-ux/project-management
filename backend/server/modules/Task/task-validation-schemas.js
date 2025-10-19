import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = Joi.object({
  projectId: Joi.string()
    .pattern(objectIdPattern)
    .message('"projectId" must be a valid ObjectId')
    .required(),
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("", null).trim().optional(),
  status: Joi.string().trim().optional(),
});

export const getTasksByProjectIdParamsSchema = Joi.object({
  projectId: Joi.string().trim().required(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow("", null).trim().optional(),
  status: Joi.string().trim().optional(),
});

export const deleteTaskParamsSchema = Joi.object({
  id: Joi.string().trim().required(),
});
