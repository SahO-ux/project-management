import { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";

import api from "../lib/api";
import { successToast, errorToast } from "../lib/toast";

/**
 * Renders structured view when available, otherwise shows plain text.
 */
export default function AIPanel({ projectId }) {
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null); // either structured object or string
  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    // Reset states
    setLoading(false);
    setAiData(null);
    setShowQA(false);
    setQuestion("");
  }, [projectId]);

  const renderStructured = (obj) => {
    return (
      <div className="space-y-2">
        {obj.summary && (
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {obj.summary}
          </div>
        )}
        {Array.isArray(obj.topTasks) && obj.topTasks.length > 0 && (
          <div>
            <div className="text-sm font-medium mt-2">Top Tasks</div>
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
            <div className="text-sm font-medium mt-2">Recommended Actions</div>
            <ol className="list-decimal list-inside text-sm text-gray-700">
              {obj.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  const summarize = async () => {
    setAiData(null);
    setLoading(true);
    try {
      const res = await api.post(`/ai/summarize/${projectId}`);
      const payload = res.data?.ai?.normalizedRes ?? res.data; // backend may wrap
      // If backend already returns a structured object:
      if (
        payload &&
        typeof payload === "object" &&
        (payload.summary || payload.topTasks || payload.actions)
      ) {
        setAiData(payload);
      } else if (typeof payload === "string") {
        // try parse JSON text from string
        try {
          const parsed = JSON.parse(payload);
          if (
            parsed &&
            typeof parsed === "object" &&
            (parsed.summary || parsed.topTasks || parsed.actions)
          ) {
            setAiData(parsed);
          } else {
            setAiData(payload);
          }
        } catch {
          setAiData(payload);
        }
      } else {
        setAiData(String(payload));
      }
      successToast("Summary ready");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || err.message || "AI summarize failed";
      errorToast(msg);
      setAiData(`AI error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return errorToast("Question required");
    setShowQA(false);
    setAiData(null);
    setLoading(true);
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
        // Support server returning { answer: "..."} as structured small response
        if (payload.answer && !payload.summary)
          setAiData({ summary: payload.answer });
        else setAiData(payload);
      } else if (typeof payload === "string") {
        try {
          const parsed = JSON.parse(payload);
          if (parsed && typeof parsed === "object") setAiData(parsed);
          else setAiData(payload);
        } catch {
          setAiData(payload);
        }
      } else {
        setAiData(String(payload));
      }
      successToast("AI answered");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "AI QA failed";
      errorToast(msg);
      setAiData(`AI error: ${msg}`);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col gap-2">
        <Button
          variant="indigo"
          className={`bg-indigo-600 hover:bg-indigo-800 ${
            !loading ? "text-white" : ""
          }`}
          onClick={summarize}
          disabled={loading}
        >
          {loading ? "Thinking…" : "AI Summarize"}
        </Button>
        <Button
          variant="success"
          className="bg-green-600 text-white"
          onClick={() => setShowQA(true)}
          disabled={loading}
        >
          Ask AI
        </Button>
      </div>

      <div className="w-[420px] bg-white rounded p-3 shadow">
        <div className="text-xs text-gray-500 mb-1">AI Response</div>
        <div className="text-sm text-gray-800">
          {loading && <div className="text-sm text-gray-500">Thinking...</div>}
          {!loading && !aiData && (
            <div className="text-sm text-gray-400">No response yet</div>
          )}
          {!loading &&
            aiData &&
            (typeof aiData === "string" ? (
              <div className="whitespace-pre-wrap">{aiData}</div>
            ) : (
              renderStructured(aiData)
            ))}
        </div>
      </div>

      {/* QA Modal */}
      <Modal show={showQA} onHide={() => setShowQA(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ask AI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Question</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Form.Text className="text-muted">
                Ask about tasks in this project (e.g., "Which tasks are
                blocked?")
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQA(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={askQuestion}>
            Ask
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
