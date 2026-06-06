import { useProfileQuery } from "@/lib/hooks/auth/profile";
import { useAuth } from "@/scripts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";

export function useAddNewTask() {
	const { user } = useAuth();
	const profileQuery = useProfileQuery();
	const queryClient = useQueryClient();

	const formatToLocalISOString = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		const offset = -date.getTimezoneOffset();
		const sign = offset >= 0 ? '+' : '-';
		const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
		const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
	};

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
				start_date: formatToLocalISOString(startDate),
				due_date: formatToLocalISOString(dueDate),
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
			queryKey: ["tasks", groupID],
		});

		queryClient.invalidateQueries({
			queryKey: ["group_logs", groupID],
		});

		return task;
	};

	return { addTask };
}
