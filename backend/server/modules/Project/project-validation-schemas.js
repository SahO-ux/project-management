import Joi from "joi";

export const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("", null).trim().optional(),
  columns: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().trim().required(),
        title: Joi.string().trim().required(),
      })
    )
    .optional(),
});

export const getProjectByIdParamsSchema = Joi.object({
  id: Joi.string().trim().required(),
});

export const deleteProjecParamsSchema = Joi.object({
  id: Joi.string().trim().required(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow("", null).trim().optional(),
  columns: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().trim().required(),
        title: Joi.string().trim().required(),
      })
    )
    .optional(),
});
