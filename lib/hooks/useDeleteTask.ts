import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useDeleteTask() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			taskId,
			groupId
		}: {
			taskId: number,
			groupId: string
		}) => {

			const { error } = await supabase
				.from("task")
				.delete()
				.eq("id", taskId)

			if (error) throw error;
		},

		onSuccess: (_, { groupId }) => {
			queryClient.invalidateQueries({
				queryKey: ["tasks", groupId]
			});

			queryClient.invalidateQueries({
				queryKey: ["user_tasks", groupId]
			});
		}
	})
}