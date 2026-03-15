import api from "./axios";

export async function getWorkspaces() {
    const response = await api.get("/workspaces/");
    return response.data;
}

export async function createWorkspace(payload) {
    const response = await api.post("/workspaces/", payload);
    return response.data;
}

export async function getWorkspace(id) {
    const response = await api.get(`/workspaces/${id}/`);
    return response.data;
}

export async function getWorkspaceMembers(workspaceId) {
    const response = await api.get(`/workspaces/${workspaceId}/members/`);
    return response.data;
}

export async function addWorkspaceMember(workspaceId, payload) {
    const response = await api.post(`/workspaces/${workspaceId}/members/add/`, payload);
    return response.data;
}