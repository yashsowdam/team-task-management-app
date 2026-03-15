import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, getTasksByProject, updateTaskStatus, assignTask } from "../api/taskApi";

export function useTasks(projectId) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createTask(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useUpdateTaskStatus(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => updateTaskStatus(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useAssignTask(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => assignTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}