import api from "../../lib/api";

export const getTasksByProject = async (projectId) => {
  const res = await api.get(`/task/${projectId}`);
  return res.data;
};

export const createTask = async (payload) => {
  const res = await api.post("/task", payload);
  return res.data;
};

export const updateTask = async (id, payload) => {
  const res = await api.patch(`/task/${id}`, payload);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/task/${id}`);
  return res.data;
};
