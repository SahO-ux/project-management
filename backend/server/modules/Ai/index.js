import express from "express";

import { aiRateLimiter } from "./ai-rate-limit.js";

import { controllers } from "../../modules-loader.js";
import {
  validateQuestionParams,
  validateSummarizeParams,
} from "./ai-validator.js";

const router = express.Router();

// Attach rate limiter to all AI routes
router.use(aiRateLimiter);

router.post(
  "/summarize",
  validateSummarizeParams,
  controllers.AiController.summarizeProject
);

router.post(
  "/question",
  validateQuestionParams,
  controllers.AiController.askProjectQuestion
);

export default {
  indexRoute: "/ai",
  router,
};
