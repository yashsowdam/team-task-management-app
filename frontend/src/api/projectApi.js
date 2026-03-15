import api from "./axios";

export async function getProjectsByWorkspace(workspaceId) {
    const response = await api.get(`/projects/workspace/${workspaceId}/`);
    return response.data;
}

export async function createProject(workspaceId, payload) {
    const response = await api.post(`/projects/workspace/${workspaceId}/`, payload);
    return response.data;
}

export async function getProject(id) {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
}