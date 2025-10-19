import { makeBodyOrQueryValidator } from "../../lib/app-utility.js";
import {
  questionParamsSchema,
  summarizeParamsSchema,
} from "./ai-validation-schemas.js";

const validateSummarizeParams = makeBodyOrQueryValidator(
  summarizeParamsSchema,
  "params"
);

const validateQuestionParams = makeBodyOrQueryValidator(questionParamsSchema);

export { validateSummarizeParams, validateQuestionParams };
