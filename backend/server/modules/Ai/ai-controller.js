import { services } from "../../modules-loader.js";
import { summarizeCache } from "./ai-cache.js";

const summarizeProject = async (req, res) => {
  try {
    const projectId = req?.params?.projectId;

    if (!projectId)
      return res
        .status(400)
        .json({ message: `Missing required URL parameter: "projectId"` });

    const cacheKey = `summarize:${projectId}`;

    // return cached response if available
    const cached = summarizeCache.get(cacheKey);
    if (cached) return res.json({ ai: cached, cached: true });

    const aiText = await services.AiService.summarizeProject(projectId);
    res.json({ ai: aiText });
  } catch (err) {
    console.error("summarizeProject error:", err);
    res.status(500).json({ message: err.message });
  }
};

const askProjectQuestion = async (req, res) => {
  try {
    const projectId = req?.params?.projectId;
    if (!projectId)
      return res
        .status(400)
        .json({ message: `Missing required URL parameter: "projectId"` });

    const { question } = req.body;
    const aiText = await services.AiService.askProjectQuestion({
      projectId,
      question,
    });
    res.json({ ai: aiText });
  } catch (err) {
    console.error("askProjectQuestion error:", err);
    res.status(500).json({ message: err.message });
  }
};

export default {
  controllerName: "AiController",
  summarizeProject,
  askProjectQuestion,
};
