import Joi from "joi";

export const questionParamsSchema = Joi.object({
  question: Joi.string().trim().min(1).required(),
});

export const summarizeParamsSchema = Joi.object({
  projectId: Joi.string().trim().required(),
});
