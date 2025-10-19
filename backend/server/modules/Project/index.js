import express from "express";

import { controllers } from "../../modules-loader.js";
import {
  validateCreateProjectParams,
  validateDeleteProjectParams,
  validateGetProjectByIdParams,
  validateUpdateProjectParams,
} from "./project-validator.js";

const router = express.Router();

router.post(
  "/",
  validateCreateProjectParams,
  controllers.ProjectController.createProject
);

router.get("/", controllers.ProjectController.getAllProjects);

router.get(
  "/:id",
  validateGetProjectByIdParams,
  controllers.ProjectController.getProjectById
);

router.patch(
  "/:id",
  validateUpdateProjectParams,
  controllers.ProjectController.updateProject
);

router.delete(
  "/:id",
  validateDeleteProjectParams,
  controllers.ProjectController.deleteProject
);

export default {
  indexRoute: "/project",
  router,
};
