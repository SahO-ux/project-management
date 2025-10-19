import { models } from "../../modules-loader.js";
import { invalidateProjectSummaryCache } from "../../lib/app-utility.js";

const createTask = async ({ projectId, title, description, status }) => {
  const payload = {
    projectId,
    title,
    ...(description && { description }),
    ...(status && { status }),
  };

  const task = models.Task.create(payload);
  invalidateProjectSummaryCache(task?.projectId);
  return task;
};

const getTasksByProject = async (projectId) => {
  return models.Task.find({ projectId, isDeleted: false }).sort({
    createdAt: -1,
  });
};

const getTaskById = async (id) => {
  return models.Task.findOne({ _id: id, isDeleted: false });
};

const updateTask = async ({ id, title, description, status }) => {
  const payload = {
    ...(title && { title }),
    ...(description && { description }),
    ...(status && { status }),
  };

  // if (!Object.keys(payload).length) return; // Nothing to update
  const updatedTask = models.Task.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    {
      new: true,
    }
  );

  invalidateProjectSummaryCache(updatedTask?.projectId);
  return updatedTask;
};

const deleteTask = async (id) => {
  const deletedTask = models.Task.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  invalidateProjectSummaryCache(deletedTask?.projectId);
  return deletedTask;
};

export default {
  serviceName: "TaskService",
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
};
