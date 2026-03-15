import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, getProject, getProjectsByWorkspace } from "../api/projectApi";

export function useProjects(workspaceId) {
    return useQuery({
        queryKey: ["projects", workspaceId],
        queryFn: () => getProjectsByWorkspace(workspaceId),
        enabled: !!workspaceId,
    });
}

export function useProject(id) {
    return useQuery({
        queryKey: ["project", id],
        queryFn: () => getProject(id),
        enabled: !!id,
    });
}

export function useCreateProject(workspaceId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => createProject(workspaceId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
        },
    });
}