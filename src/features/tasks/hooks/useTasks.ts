import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "../../../lib/api";

export interface TaskItem {
  _id: string;
  name: string;
  email: string;
  projectTitle?: string;
  service: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function useTasks(statusFilter?: string) {
  return useQuery({
    queryKey: ["tasks", statusFilter || "all"],
    queryFn: async () => {
      const url = statusFilter ? `${ENDPOINTS.TASK_REQUEST_LIST}?status=${statusFilter}` : ENDPOINTS.TASK_REQUEST_LIST;
      const { data, error } = await apiRequest<{ tasks: TaskItem[]; total: number }>(url);
      if (error) throw new Error(error);
      return data?.tasks || [];
    },
  });
}

export function useTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { data, error } = await apiRequest(ENDPOINTS.TASK_REQUEST_UPDATE_STATUS(id), {
        method: "PUT",
        body: { status, note },
      });
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useTaskDeleteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await apiRequest(ENDPOINTS.TASK_REQUEST_BY_ID(id), {
        method: "DELETE",
      });
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
