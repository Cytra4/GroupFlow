import { useAuth } from "@/scripts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useDeleteTask() {
	const { user } = useAuth();
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			taskId,
			groupId
		}: {
			taskId: number,
			groupId: string
		}) => {

			if (!user) return;

			const { data: task, error: fetchError } = await supabase
				.from("task")
				.select("title")
				.eq("id", taskId)
				.single();

			if (fetchError) throw fetchError;

			const { error: logError } = await supabase
				.from("group_logs")
				.insert({
					group_id: groupId,
					user_id: user.id,
					action_type: "delete",
					target_type: "task",
					target_id: String(taskId),
					content: task.title,
				});

			if (logError) throw logError;

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