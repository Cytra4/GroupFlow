import { useProfile } from "@/lib/hooks/auth/profile";
import { useAuth } from "@/scripts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";

export function useAddNewTask() {
	const { user } = useAuth();
	const profileQuery = useProfile();
	const queryClient = useQueryClient();

	const addTask = async (
		groupID: string,
		title: string,
		description: string,
		priority: number,
		startDate: Date,
		dueDate: Date,
		assignedUserIds: string[]
	) => {
		if (!user) return;

		let taskStatus = "unfinished";

		//Task
		const { data: task, error: taskError } = await supabase
			.from("task")
			.insert({
				title,
				group_id: groupID,
				description,
				status: taskStatus,
				priority,
				start_date: startDate.toISOString(),
				due_date: dueDate.toISOString(),
				created_by: user.id,
			})
			.select()
			.single();

		if (taskError) throw taskError;

		//Task Members
		if (assignedUserIds.length > 0) {
			const members = assignedUserIds.map((userId) => ({
				group_id: groupID,
				task_id: task.id,
				user_id: userId,
				created_at: new Date().toISOString(),
			}));

			const { error } = await supabase
				.from("task_members")
				.insert(members);

			if (error) throw error;
		}

		//Log
		const { error: logError } = await supabase
		.from("group_logs")
		.insert({
			group_id: groupID,
			user_id: profileQuery.data?.user_id,
			username: profileQuery.data?.username,
			action_type: "create",
			target_type: "task",
			target_id: task.id,
			content: title
		})

		if (logError) throw logError;

		queryClient.invalidateQueries({
			queryKey: ["task", groupID],
		});

		return task;
	};

	return { addTask };
}
