import { services } from "../../modules-loader.js";

const createProject = async (req, res) => {
  try {
    const { name, description, columns } = req.body;
    const project = await services.ProjectService.createProject({
      name,
      description,
      columns,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("createProject error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await services.ProjectService.getAllProjects();
    res.json(projects);
  } catch (err) {
    console.error("getAllProjects error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await services.ProjectService.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error("getProjectById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const payload = req.body || {};
    const id = req?.params?.id;
    if (!id)
      return res
        .status(400)
        .json({ message: "Missing required query parameter: id" });

    const updatedProject = await services.ProjectService.updateProject({
      id: req.params.id,
      payload,
    });
    res.json(updatedProject);
  } catch (err) {
    console.error("updateProject error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await services.ProjectService.deleteProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteProject error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  controllerName: "ProjectController",
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
