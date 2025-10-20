import { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";

import api from "../lib/api";
import { successToast, errorToast } from "../lib/toast";

export default function AIPanel({ projectId }) {
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null); // structured object or string
  const [question, setQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    setLoading(false);
    setAskingQuestion(false);
    setAiData(null);
    setQuestion("");
  }, [projectId]);

  const renderStructured = (obj) => {
    return (
      <div className="space-y-3">
        {obj.summary && (
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {obj.summary}
          </div>
        )}

        {Array.isArray(obj.topTasks) && obj.topTasks.length > 0 && (
          <div>
            <div className="text-sm font-semibold mt-2">Top Tasks</div>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {obj.topTasks.map((t, i) => (
                <li key={i}>
                  <strong>{t.title}</strong>
                  {t.summary ? ` — ${t.summary}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(obj.actions) && obj.actions.length > 0 && (
          <div>
            <div className="text-sm font-semibold mt-2">
              Recommended Actions
            </div>
            <ol className="list-decimal list-inside text-sm text-gray-700">
              {obj.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
          </div>
        )}

        {obj.note && (
          <div className="text-xs text-gray-500 mt-2">{obj.note}</div>
        )}
      </div>
    );
  };

  const summarize = async () => {
    setAiData(null);
    setLoading(true);
    try {
      const res = await api.post(`/ai/summarize/${projectId}`);
      const payload = res.data?.ai?.normalizedRes ?? res.data;

      if (
        payload &&
        typeof payload === "object" &&
        (payload.summary || payload.topTasks || payload.actions)
      ) {
        setAiData(payload);
      } else if (typeof payload === "string") {
        try {
          const parsed = JSON.parse(payload);
          setAiData(parsed && typeof parsed === "object" ? parsed : payload);
        } catch {
          setAiData(payload);
        }
      } else {
        setAiData(String(payload));
      }

      successToast("Summary ready");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || err.message || "AI summarize failed";
      errorToast(message);
      setAiData(`AI error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question?.trim()) return errorToast("Question required");
    setAiData(null);
    setAskingQuestion(true);
    try {
      const res = await api.post(`/ai/question/${projectId}`, {
        question: question?.trim(),
      });
      const payload = res.data?.ai?.normalizedRes ?? res.data;
      if (
        payload &&
        typeof payload === "object" &&
        (payload.summary ||
          payload.topTasks ||
          payload.actions ||
          payload.answer)
      ) {
        if (payload.answer && !payload.summary)
          setAiData({ summary: payload.answer });
        else setAiData(payload);
      } else if (typeof payload === "string") {
        try {
          const parsed = JSON.parse(payload);
          setAiData(parsed && typeof parsed === "object" ? parsed : payload);
        } catch {
          setAiData(payload);
        }
      } else {
        setAiData(String(payload));
      }
      successToast("AI answered");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || err.message || "AI QA failed";
      errorToast(message);
      setAiData(`AI error: ${message}`);
    } finally {
      setAskingQuestion(false);
      setQuestion("");
      if (textRef.current) textRef.current.blur();
    }
  };

  return (
    <div className="w-full">
      {/* Grid: left = response, right = ask. Right column fixed width on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4">
        {/* LEFT: Response */}
        <div className="bg-white rounded border p-4 min-h-[180px]">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-semibold">AI Response</h3>
            {/* <div className="text-xs text-gray-500">Summarize or Ask</div> */}
            <button
              onClick={summarize}
              disabled={loading || askingQuestion}
              className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Summarizing..." : "Summarize All Tasks"}
            </button>
          </div>

          <div className="text-sm text-gray-700">
            {(loading || askingQuestion) && (
              <div className="text-gray-500">Thinking…</div>
            )}

            {!loading && !aiData && !askingQuestion && (
              <div className="text-gray-400">
                No response yet — click "Summarize" or ask a question.
              </div>
            )}

            {!loading &&
              !askingQuestion &&
              aiData &&
              (typeof aiData === "string" ? (
                <div className="whitespace-pre-wrap max-h-[48vh] overflow-auto">
                  {aiData}
                </div>
              ) : (
                <div className="max-h-[48vh] overflow-auto">
                  {renderStructured(aiData)}
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT: Ask panel */}
        <div className="bg-white rounded border p-4 flex flex-col">
          <div className="mb-2">
            <h4 className="text-sm font-semibold">Ask AI</h4>
            <div className="text-xs text-gray-500">
              Ask about tasks in this project
            </div>
          </div>

          <div className="flex-1">
            <Form>
              <Form.Group controlId="aiQuestion">
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder='E.g., "Which tasks are blocked?"'
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  ref={textRef}
                  className="resize-y"
                />
              </Form.Group>
            </Form>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={askQuestion}
              disabled={loading || askingQuestion}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow-sm hover:bg-green-700 disabled:opacity-60"
            >
              Ask
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Tip: Be specific (mention task titles or statuses) for better
            answers.
          </div>
        </div>
      </div>
    </div>
  );
}
