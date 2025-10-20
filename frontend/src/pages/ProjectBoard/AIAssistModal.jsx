import { Modal, Button } from "react-bootstrap";

import AIPanel from "../../ui/AIPanel";

const AIAssistModal = ({ show, onHide, project = {} }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      fullscreen="sm-down"
      aria-labelledby="ai-modal-title"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="ai-modal-title">
          AI Assistant — {project.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-3">
          <div className="text-sm text-gray-600 text-truncate w-44">
            {project.description}
          </div>
        </div>

        {/* Reuse your existing AIPanel inside the modal (it will render summary / QA) */}
        <AIPanel projectId={project._id} />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AIAssistModal;
