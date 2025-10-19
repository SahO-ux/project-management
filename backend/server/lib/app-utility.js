import { summarizeCache } from "../modules/Ai/ai-cache.js";

const makeBodyOrQueryValidator = (schema, source = "body") => {
  if (!schema)
    throw new TypeError(
      `Missing "schema" param: makeBodyOrQueryValidator() - app-utility.js`
    );

  if (source !== "body" && source !== "query" && source !== "params")
    throw new TypeError(
      `Invalid "source" param: makeBodyOrQueryValidator() - app-utility.js`
    );

  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      stripUnknown: true,
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: error.details.map((d) => d.message).join(", "),
      });
    }
    req[source] = value;
    return next();
  };
};

const invalidateProjectSummaryCache = (projectId) => {
  try {
    if (!projectId) return;
    const key = `summarize:${String(projectId)}`;
    summarizeCache.del(key);
    console.log(`[Cache] Invalidated summarize cache for project ${projectId}`);
  } catch (err) {
    console.warn("[Cache] Failed to invalidate summarize cache:", err.message);
  }
};

export { makeBodyOrQueryValidator, invalidateProjectSummaryCache };
