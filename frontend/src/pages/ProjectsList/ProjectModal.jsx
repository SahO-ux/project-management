import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

import { successToast, errorToast } from "../../lib/toast";
import { createProject, updateProject } from "./actions";

export default function ProjectModal({
  show,
  mode = "create",
  project = null,
  onHide,
  onSaved,
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && project) {
      setName(project.name || "");
      setDesc(project.description || "");
    } else {
      setName("");
      setDesc("");
    }
  }, [mode, project, show]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return errorToast("Name required");
    setLoading(true);

    try {
      if (mode === "create") {
        const created = await createProject({
          name: name.trim(),
          description: desc.trim(),
        });
        // Expect created project object returned
        successToast("Project created");
        onSaved?.(created);
      } else {
        const updated = await updateProject(project._id, {
          name: name.trim(),
          description: desc.trim(),
        });
        successToast("Project updated");
        onSaved?.(updated);
      }
      onHide?.();
    } catch (err) {
      console.error(err);
      errorToast(
        err.response?.data?.error ||
          (mode === "create"
            ? "Failed to create project"
            : "Failed to update project")
      );
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "create" ? "Create Project" : "Edit Project";
  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Optional description"
            />
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
