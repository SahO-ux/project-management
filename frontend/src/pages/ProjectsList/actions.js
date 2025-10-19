import api from "../../lib/api";

export const getAllProjects = async () => {
  const res = await api.get("/project");
  return res.data;
};

export const getProject = async (id) => {
  const res = await api.get(`/project/${id}`);
  return res.data;
};

export const createProject = async (payload) => {
  const res = await api.post("/project", payload);
  return res.data;
};

export const updateProject = async (id, payload) => {
  const res = await api.patch(`/project/${id}`, payload);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await api.delete(`/project/${id}`);
  return res.data;
};
