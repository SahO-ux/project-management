import React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableTask({ id, task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!task) return null;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-white rounded border shadow-sm cursor-grab"
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-medium">{task.title}</div>
          <div className="text-xs text-gray-500">{task.description}</div>
          <div className="text-xs text-gray-400 mt-1">
            Updated: {new Date(task.updatedAt).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-sm text-indigo-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-sm text-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
