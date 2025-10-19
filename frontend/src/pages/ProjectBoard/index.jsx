import React, { useEffect, useState } from "react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableTask from "./SortableTask";
import AIPanel from "../../ui/AIPanel";
import { successToast, errorToast } from "../../lib/toast";
import TaskModal from "./TaskModal";
import { deleteTask, getTasksByProject, updateTask } from "./actions";

/**
 * ColumnDroppable: minimal wrapper to register a column as droppable.
 * It exposes a ref (setNodeRef) and an isOver flag for simple styling.
 */
const ColumnDroppable = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${isOver ? "ring-2 ring-indigo-300" : ""} min-h-[120px]`}
    >
      {children}
    </div>
  );
};

export default function ProjectBoard({ project }) {
  const [tasksMap, setTasksMap] = useState({});
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(false);
  const [taskModal, setTaskModal] = useState({
    show: false,
    mode: "create",
    task: null,
    columnId: null,
  });

  const loadTasks = async () => {
    setLoading(true);

    try {
      const list = await getTasksByProject(project._id);
      const map = {};
      list.forEach((t) => (map[t._id] = t));
      setTasksMap(map);

      const cols = {};
      project.columns.forEach((c) => {
        cols[c.key] = { id: c.key, title: c.title, taskIds: [] };
      });
      list.forEach((t) => {
        if (!cols[t.status])
          cols[t.status] = { id: t.status, title: t.status, taskIds: [] };
        cols[t.status].taskIds.push(t._id);
      });
      setColumns(cols);
    } catch (err) {
      console.error(err);
      errorToast("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [project]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    // active.id format: `${sourceColId}:${taskId}`
    // over.id can be `${targetColId}:${someTaskId}` or just `targetColId` (empty column)
    const activeParts = String(active.id).split(":");
    const sourceColId = activeParts[0];
    const taskId = activeParts[1];

    const overId = String(over.id);
    let targetColId = null;
    if (overId.includes(":")) {
      targetColId = overId.split(":")[0];
    } else {
      targetColId = overId;
    }

    if (!taskId || !targetColId) return;
    if (sourceColId === targetColId) return;

    // optimistic local update
    setColumns((prev) => {
      const next = { ...prev };
      // remove from source safely
      if (next[sourceColId]) {
        next[sourceColId] = {
          ...next[sourceColId],
          taskIds: next[sourceColId].taskIds.filter((id) => id !== taskId),
        };
      }
      // add to top of target
      if (!next[targetColId])
        next[targetColId] = {
          id: targetColId,
          title: targetColId,
          taskIds: [],
        };
      next[targetColId] = {
        ...next[targetColId],
        taskIds: [taskId, ...next[targetColId].taskIds],
      };
      return next;
    });

    // update the task in tasksMap locally immediately
    setTasksMap((prev) => {
      const updatedTask = {
        ...(prev[taskId] || {}),
        status: targetColId,
        updatedAt: new Date().toISOString(),
      };
      return { ...prev, [taskId]: updatedTask };
    });

    try {
      const updatedTask = await updateTask(taskId, { status: targetColId });
      successToast("Task moved");
      // reconcile authoritative server result
      updateTaskLocally(updatedTask);
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.error || "Failed to move task");
      await loadTasks(); // rollback
    }
  };

  // helper: insert task into local state
  const insertTaskLocally = (task) => {
    setTasksMap((prev) => ({ ...prev, [task._id]: task }));
    setColumns((prev) => {
      const next = { ...prev };
      // ensure column exists
      if (!next[task.status])
        next[task.status] = {
          id: task.status,
          title: task.status,
          taskIds: [],
        };
      // put new task at top of column
      next[task.status] = {
        ...next[task.status],
        taskIds: [task._id, ...next[task.status].taskIds],
      };
      return next;
    });
  };

  // helper: update task locally (also handle status change)
  function updateTaskLocally(task) {
    setTasksMap((prev) => ({ ...prev, [task._id]: task }));
    setColumns((prev) => {
      const next = { ...prev };
      // remove from all columns if present
      Object.keys(next).forEach((colId) => {
        next[colId] = {
          ...next[colId],
          taskIds: next[colId].taskIds.filter((id) => id !== task._id),
        };
      });
      // ensure target column exists
      if (!next[task.status])
        next[task.status] = {
          id: task.status,
          title: task.status,
          taskIds: [],
        };
      // add to top (or bottom as you prefer)
      next[task.status] = {
        ...next[task.status],
        taskIds: [task._id, ...next[task.status].taskIds],
      };
      return next;
    });
  }

  // helper: delete locally
  const deleteTaskLocally = (taskId) => {
    setTasksMap((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setColumns((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((colId) => {
        next[colId] = {
          ...next[colId],
          taskIds: next[colId].taskIds.filter((id) => id !== taskId),
        };
      });
      return next;
    });
  };

  const openCreateModal = (columnId) => {
    setTaskModal({ show: true, mode: "create", task: null, columnId });
  };

  const openEditModal = (task) => {
    setTaskModal({ show: true, mode: "edit", task, columnId: task.status });
  };

  const closeTaskModal = () => {
    setTaskModal({ show: false, mode: "create", task: null, columnId: null });
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete task?")) return;
    try {
      await deleteTask(taskId);
      successToast("Task deleted");
      // delete locally using known id (don't rely on API response shape)
      deleteTaskLocally(taskId);
      // await loadTasks();
      // onProjectUpdate?.();
    } catch (err) {
      console.error(err);
      errorToast("Failed to delete task");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{project.name}</h2>
          <p className="text-sm text-gray-500">{project.description}</p>
        </div>
        <AIPanel projectId={project._id} />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-auto pb-6">
            {Object.values(columns).map((col) => (
              <div key={col.id} className="w-80 bg-gray-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">
                    {col.title} ({col.taskIds.length})
                  </h3>
                  <button
                    className="text-blue-600 text-sm"
                    onClick={() => openCreateModal(col.id)}
                  >
                    + Add
                  </button>
                </div>

                <ColumnDroppable id={col.id}>
                  <SortableContext
                    items={col.taskIds.map((id) => `${col.id}:${id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {col.taskIds.map((taskId) => (
                        <SortableTask
                          key={taskId}
                          id={`${col.id}:${taskId}`}
                          task={tasksMap[taskId]}
                          onEdit={openEditModal}
                          onDelete={() => handleDelete(taskId)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </ColumnDroppable>
              </div>
            ))}
          </div>
        </DndContext>
      )}

      <TaskModal
        show={taskModal.show}
        mode={taskModal.mode}
        task={taskModal.task}
        defaultColumn={taskModal.columnId}
        projectId={project._id}
        onHide={closeTaskModal}
        insertTaskLocally={insertTaskLocally}
        updateTaskLocally={updateTaskLocally}
      />
    </div>
  );
}
