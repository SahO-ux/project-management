import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import {
  createTaskSchema,
  deleteTaskParamsSchema,
  getTasksByProjectIdParamsSchema,
  updateTaskSchema,
} from "./task-validation-schemas.js";

const validateCreateTaskParams = makeBodyOrQueryValidator(createTaskSchema);

const validateGetTasksByProjectId = makeBodyOrQueryValidator(
  getTasksByProjectIdParamsSchema,
  "params"
);

const validateUpdateTaskParams = makeBodyOrQueryValidator(updateTaskSchema);

const validateDeleteTaskParams = makeBodyOrQueryValidator(
  deleteTaskParamsSchema,
  "params"
);

export {
  validateCreateTaskParams,
  validateGetTasksByProjectId,
  validateUpdateTaskParams,
  validateDeleteTaskParams,
};
