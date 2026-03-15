import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkspace, getWorkspace, getWorkspaceMembers, getWorkspaces, addWorkspaceMember } from "../api/workspaceApi";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });
}

export function useWorkspace(id) {
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: () => getWorkspace(id),
    enabled: !!id,
  });
}

export function useWorkspaceMembers(workspaceId) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useAddWorkspaceMember(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => addWorkspaceMember(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
  });
}