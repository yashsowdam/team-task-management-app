import api from "./axios";

export async function getTasksByProject(projectId) {
  const response = await api.get(`/tasks/project/${projectId}/`);
  return response.data;
}

export async function createTask(projectId, payload) {
  const response = await api.post(`/tasks/project/${projectId}/`, payload);
  return response.data;
}

export async function updateTaskStatus(taskId, payload) {
  const response = await api.patch(`/tasks/${taskId}/status/`, payload);
  return response.data;
}

export async function assignTask(taskId, payload) {
  const response = await api.patch(`/tasks/${taskId}/assign/`, payload);
  return response.data;
}