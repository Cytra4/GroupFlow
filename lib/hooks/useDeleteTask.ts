import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { useProfileQuery } from "./auth/profile";

export function useDeleteTask() {
	const profileQuery = useProfileQuery();
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			taskId,
			groupId
		}: {
			taskId: number,
			groupId: string
		}) => {

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
					user_id: profileQuery.data?.user_id,
					username: profileQuery.data?.username,
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

			queryClient.invalidateQueries({
				queryKey: ["group_logs", groupId]
			});
		}
	})
}