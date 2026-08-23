import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "../../../lib/api";

export function useAiProposalDraftMutation() {
  return useMutation({
    mutationFn: async (taskRequestId: string) => {
      const { data, error } = await apiRequest<{ draft: any }>(ENDPOINTS.PROPOSAL_ADMIN_AI_DRAFT, {
        method: "POST",
        body: { taskRequestId },
      });
      if (error) throw new Error(error);
      return data?.draft;
    },
  });
}

export function useCreateProposalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalData: any) => {
      const { data, error } = await apiRequest(ENDPOINTS.PROPOSAL_ADMIN_CREATE, {
        method: "POST",
        body: proposalData,
      });
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}
