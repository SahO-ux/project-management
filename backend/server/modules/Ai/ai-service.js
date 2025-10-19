import { GoogleGenAI } from "@google/genai";

import { models } from "../../modules-loader.js";

const API_KEY = process.env.GENAI_API_KEY;
const MODEL = process.env.GENAI_MODEL || "gemini-2.5-pro";

if (!API_KEY) {
  console.warn(
    "GENAI_API_KEY not set. AI calls will fail until you set GENAI_API_KEY in environment."
  );
}

/**
 * Create a Google GenAI client for Developer API (apiKey).
 * NOTE: We intentionally avoid Vertex-specific config here (per request).
 */
const createGenClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Convert tasks array into readable text for prompts.
 */
const buildTaskListText = (tasks) => {
  if (!tasks || tasks.length === 0) return "(no tasks)";
  return tasks
    .map(
      (t) =>
        `- ${t.title}: ${t.description || "<no description>"} [status:${
          t.status
        }]`
    )
    .join("\n");
};

/**
 * Normalize different potential response shapes returned by the SDK.
 * The GenAI SDK / model can return different structures based on version;
 * try common places to pick the human-readable text.
 */
const normalizeGenResponse = (res) => {
  if (!res) return "";

  // 1) simple string
  if (typeof res === "string" && res.trim()) return res.trim();

  // 2) top-level text field
  if (typeof res.text === "string" && res.text.trim()) return res.text.trim();

  // 3) result / output_text
  if (typeof res.result === "string" && res.result.trim())
    return res.result.trim();
  if (typeof res.output_text === "string" && res.output_text.trim())
    return res.output_text.trim();

  // 4) output array shape: output[0].content or output[0].content[0].text etc.
  if (Array.isArray(res.output) && res.output.length > 0) {
    const first = res.output[0];
    // common --> first.content (string)
    if (typeof first.content === "string" && first.content.trim())
      return first.content.trim();

    // content as array of chunks
    if (Array.isArray(first.content) && first.content.length > 0) {
      // map chunks to text if available
      const parts = first.content
        .map((c) => {
          if (typeof c === "string") return c;
          if (typeof c?.text === "string") return c.text;
          if (typeof c?.content === "string") return c.content;
          return "";
        })
        .filter(Boolean);
      if (parts.length) return parts.join(" ").trim();
    }

    // sometimes content is under first.content[0].text
    if (Array.isArray(first.content) && first.content[0]?.text)
      return first.content[0].text.trim();
  }

  // 5) output[0].text
  if (Array.isArray(res.output) && res.output[0]?.text)
    return res.output[0].text.trim();

  // fallback: stringified JSON (short)
  try {
    return JSON.stringify(res).slice(0, 2000);
  } catch (e) {
    return String(res);
  }
};

/**
 * Call the GenAI model using @google/genai client.
 * We use models.generateContent() if available, otherwise attempt generate().
 * Keep the call generic and normalize response.
 */
const callGenAI = async (prompt, model = MODEL) => {
  const client = createGenClient();

  // Try SDK method variants (some SDK versions expose different method names).
  // We'll try generateContent first (used in some examples), then fallback to models.generate.
  try {
    if (typeof client.models?.generateContent === "function") {
      const resp = await client.models.generateContent({
        model,
        contents: prompt,
      });
      return normalizeGenResponse(resp);
    }

    if (typeof client.models?.generate === "function") {
      // some versions expect { model, input: prompt } or { model, prompt }
      // try two shapes
      try {
        const r1 = await client.models.generate({ model, input: prompt });
        return normalizeGenResponse(r1);
      } catch (e) {
        const r2 = await client.models.generate({ model, prompt });
        return normalizeGenResponse(r2);
      }
    }

    // as a last resort, attempt a generic call (may fail on some SDK versions)
    // const generic = await client.request?.({
    //   path: `/v1/models/${model}:generate`,
    //   method: "POST",
    //   body: { prompt },
    // });
    // return normalizeGenResponse(generic);
  } catch (err) {
    // bubble up a helpful error
    const message = err?.response?.data
      ? JSON.stringify(err.response.data)
      : err.message || String(err);
    throw new Error(`GenAI call failed: ${message}`);
  }
};

/**
 * Public: Summarize all tasks in a project
 */
const summarizeProject = async (projectId) => {
  const project = await models.Project.findOne({
    _id: projectId,
    isDeleted: false,
  });
  if (!project) {
    const e = new Error("Project not found");
    e.status = 404;
    throw e;
  }

  const tasks = await models.Task.find({ projectId, isDeleted: false }).sort({
    createdAt: -1,
  });
  const taskList = buildTaskListText(tasks);

  const prompt = `You are an assistant. Provide a concise, actionable summary for the project "${
    project.name
  }".
Include:
1) A short 2-4 sentence summary of current project status.
2) A one-line summary for the top 5 tasks (if available).
3) Top 3 recommended next actions (bullet points).

Project description: ${project.description || "<no description>"}

Tasks:
${taskList}

Please return plain text with short bullets for actions.`;

  const aiRaw = await callGenAI(prompt, MODEL);
  const aiText = normalizeGenResponse(aiRaw);
  return aiText;
};

/**
 * Public: Ask a question related to the project tasks
 */
const askProjectQuestion = async ({ projectId, question }) => {
  if (!question || !question.trim()) {
    const e = new Error("Question is required");
    e.status = 400;
    throw e;
  }

  const project = await models.Project.findOne({
    _id: projectId,
    isDeleted: false,
  });
  if (!project) {
    const e = new Error("Project not found");
    e.status = 404;
    throw e;
  }

  const tasks = await models.Task.find({ projectId, isDeleted: false }).sort({
    createdAt: -1,
  });
  const taskList = buildTaskListText(tasks);

  const prompt = `You are an assistant. Here is the project and its tasks:

Project: ${project.name}
Description: ${project.description || "<no description>"}

Tasks:
${taskList}

Question: ${question}

Answer concisely and, where relevant, reference task titles. If the question cannot be answered from the provided tasks, say "I don't have enough information in the tasks to answer that."`;

  const aiRaw = await callGenAI(prompt, MODEL);
  const aiText = normalizeGenResponse(aiRaw);
  return aiText;
};

export default {
  serviceName: "AiService",
  summarizeProject,
  askProjectQuestion,
};
