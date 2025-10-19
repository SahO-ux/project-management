import { invalidateProjectSummaryCache } from "../../lib/app-utility.js";
import { models } from "../../modules-loader.js";

const createProject = async ({ name, description, columns }) => {
  const payload = { name, description, columns };
  return models.Project.create(payload);
};

const getAllProjects = async () => {
  return models.Project.find({ isDeleted: false }).sort({ createdAt: -1 });
};

const getProjectById = async (id) => {
  return models.Project.findOne({ _id: id, isDeleted: false });
};

const updateProject = ({ id, data }) => {
  const updateProject = models.Project.findOneAndUpdate(
    { _id: id, isDeleted: false },
    data,
    {
      new: true,
    }
  );
  invalidateProjectSummaryCache(updateProject?._id);
  return updateProject;
};

const deleteProject = async (id) => {
  // mark project deleted and optionally soft-delete tasks
  const project = await models.Project.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (project) {
    // optional: soft-delete tasks belonging to this project
    await models.Task.updateMany({ projectId: id }, { isDeleted: true });

    invalidateProjectSummaryCache(id);
  }
  return project;
};

export default {
  serviceName: "ProjectService",
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
