import express from "express";

import { controllers } from "../../modules-loader.js";
import {
  validateCreateTaskParams,
  validateDeleteTaskParams,
  validateGetTasksByProjectId,
  validateUpdateTaskParams,
} from "./task-validator.js";

const router = express.Router();

router.post(
  "/",
  validateCreateTaskParams,
  controllers.TaskController.createTask
);

router.get(
  "/:projectId",
  validateGetTasksByProjectId,
  controllers.TaskController.getTasksByProjectId
);

router.patch(
  "/:id",
  validateUpdateTaskParams,
  controllers.TaskController.updateTask
);

router.delete(
  "/:id",
  validateDeleteTaskParams,
  controllers.TaskController.deleteTask
);

export default {
  indexRoute: "/task",
  router,
};
