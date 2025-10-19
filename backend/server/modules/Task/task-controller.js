import { services } from "../../modules-loader.js";

const createTask = async (req, res) => {
  try {
    const { projectId, title, description, status } = req.body;

    if (!projectId || !title)
      return res.status(400).json({
        message: `Missing required parameter: Either "projectId" or "title" param is missing`,
      });

    const task = await services.TaskService.createTask({
      projectId,
      title,
      description,
      status,
    });
    res.status(201).json(task);
  } catch (err) {
    console.error("createTask error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getTasksByProjectId = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId)
      return res.status(400).json({
        message: `Missing required URL parameter: "projectId"`,
      });
    const tasks = await services.TaskService.getTasksByProject(
      req.params.projectId
    );
    res.json(tasks);
  } catch (err) {
    console.error("getTasksByProjectId error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const taskId = req?.params?.id;
    if (!taskId)
      return res.status(400).json({
        message: `Missing required URL parameter: "taskId"`,
      });
    const updatedTask = await services.TaskService.updateTask({
      id: req.params.id,
      title,
      description,
      status,
    });
    res.json(updatedTask);
  } catch (err) {
    console.error("updateTask error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req?.params?.id;
    if (!taskId)
      return res.status(400).json({
        message: `Missing required URL parameter: "taskId"`,
      });
    const task = await services.TaskService.deleteTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteTask error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  controllerName: "TaskController",
  createTask,
  getTasksByProjectId,
  updateTask,
  deleteTask,
};
