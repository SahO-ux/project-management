import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import {
  createProjectSchema,
  deleteProjecParamsSchema,
  getProjectByIdParamsSchema,
  updateProjectSchema,
} from "./project-validation-schemas.js";

const validateCreateProjectParams =
  makeBodyOrQueryValidator(createProjectSchema);

const validateGetProjectByIdParams = makeBodyOrQueryValidator(
  getProjectByIdParamsSchema,
  "params"
);

const validateUpdateProjectParams =
  makeBodyOrQueryValidator(updateProjectSchema);

const validateDeleteProjectParams = makeBodyOrQueryValidator(
  deleteProjecParamsSchema,
  "params"
);

export {
  validateCreateProjectParams,
  validateGetProjectByIdParams,
  validateUpdateProjectParams,
  validateDeleteProjectParams,
};
