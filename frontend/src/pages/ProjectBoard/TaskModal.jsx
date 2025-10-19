import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

import { successToast, errorToast } from "../../lib/toast";
import { createTask, updateTask } from "./actions";

export default function TaskModal({
  show,
  onHide,
  mode = "create",
  task = null,
  projectId,
  defaultColumn = "todo",
  insertTaskLocally,
  updateTaskLocally,
}) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || defaultColumn);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setStatus(task?.status || defaultColumn);
  }, [task, defaultColumn, show]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!title.trim()) return errorToast("Title required");
    setLoading(true);
    try {
      if (mode === "create") {
        const _task = await createTask({
          projectId,
          title: title.trim(),
          description: description.trim(),
          status,
        });
        successToast("Task created");
        insertTaskLocally(_task);
      } else {
        const updatedTask = await updateTask(task._id, {
          title: title.trim(),
          description: description.trim(),
          status,
        });
        successToast("Task updated");
        updateTaskLocally(updatedTask);
      }
      onHide();
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.error || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSave}>
        <Modal.Header closeButton>
          <Modal.Title>
            {mode === "create" ? "Create Task" : "Edit Task"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Status (Column)</Form.Label>
            <Form.Control
              as="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {/* Using default columns; you may want to pass actual project.columns */}
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
