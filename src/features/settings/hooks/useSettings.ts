import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "../../../lib/api";

export interface SettingItem {
  key: string;
  value: string;
  description?: string;
  category?: string;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await apiRequest<SettingItem[]>(ENDPOINTS.SETTINGS_LIST);
      if (error) throw new Error(error);
      return data || [];
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Array<{ key: string; value: string }>) => {
      const { data, error } = await apiRequest(ENDPOINTS.SETTINGS_BULK, {
        method: "PUT",
        body: { settings },
      });
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
