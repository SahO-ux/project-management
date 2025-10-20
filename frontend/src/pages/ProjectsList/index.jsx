import { useState } from "react";

import { successToast, errorToast } from "../../lib/toast";
import ProjectModal from "./ProjectModal";
import { deleteProject } from "./actions";

export default function ProjectsList({
  projects = [],
  selected,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}) {
  // unified modal state
  const [modalState, setModalState] = useState({
    show: false,
    mode: "create", // 'create' | 'edit'
    project: null, // project object when editing
  });

  const openCreate = () => {
    setModalState({ show: true, mode: "create", project: null });
  };

  const openEdit = (p) => {
    setModalState({ show: true, mode: "edit", project: p });
  };

  const closeModal = () => {
    setModalState({ show: false, mode: "create", project: null });
  };

  const removeProject = async (id) => {
    if (!confirm("Delete project?")) return;
    try {
      await deleteProject(id);
      successToast("Project deleted");
      // update parent state locally instead of refetching
      onDelete?.(id);
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.error || "Failed to delete project");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <button
          className="w-full px-3 py-2 bg-blue-600 text-white rounded"
          onClick={openCreate}
        >
          + New Project
        </button>
      </div>

      <ul className="space-y-2">
        {projects.map((p) => (
          <li
            key={p._id}
            className={`p-2 rounded flex items-start justify-between cursor-pointer ${
              selected?._id === p._id ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
            onClick={() => onSelect(p)}
          >
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-gray-500 truncate w-44">
                {p.description}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Created: {new Date(p.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="ml-2 flex flex-col gap-1 items-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(p);
                }}
                className="text-indigo-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeProject(p._id);
                }}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ProjectModal
        show={modalState.show}
        mode={modalState.mode}
        project={modalState.project}
        onHide={closeModal}
        onSaved={(proj) => {
          if (modalState.mode === "create") {
            onCreate?.(proj);
          } else {
            onUpdate?.(proj);
          }
          closeModal();
        }}
      />
    </div>
  );
}
