import { useAuth } from "@/scripts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";

export function useAddNewTask() {
	const { user } = useAuth();
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

		const start_date = startDate.toISOString();
		const due_date = dueDate.toISOString();

		const now = new Date();
		let taskStatus: "未開始" | "進行中" | "未完成";

		if (now < startDate) taskStatus = "未開始";
		else if (now > dueDate) taskStatus = "未完成";
		else taskStatus = "進行中";

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

		queryClient.invalidateQueries({
			queryKey: ["task", groupID],
		});

		return task;
	};

	return { addTask };
}
