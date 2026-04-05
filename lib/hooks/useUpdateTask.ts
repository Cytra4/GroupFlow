import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { useProfile } from "./auth/profile";

type UpdateTaskInput = {
	taskId: number;
	groupId: string;
	taskTitle: string;
	taskContent: string;
	startDate: Date;
	endDate: Date;
	priority: number;
}

type UpdateTaskMembersInput = {
	taskId: number;
	groupId: string;
	newUserIds: string[];
	currentUserIds: string[];
};

type FinishTaskInput = {
	taskId: number;
	groupId: string;
}

//更新任務內容
export function useUpdateTask() {
	const profileQuery = useProfile();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			taskId,
			groupId,
			taskTitle,
			taskContent,
			startDate,
			endDate,
			priority,
		}: UpdateTaskInput) => {
			const start_date = startDate.toISOString();
			const due_date = endDate.toISOString();

			let taskStatus = "unfinished";

			const { data, error } = await supabase
				.from("task")
				.update({
					title: taskTitle,
					description: taskContent,
					status: taskStatus,
					priority: priority,
					start_date: start_date,
					due_date: due_date
				})
				.eq("id", taskId)

			if (error) throw error;

			const { error: logError} = await supabase
				.from("group_logs")
				.insert({
					group_id: groupId,
					user_id: profileQuery.data?.user_id,
					username: profileQuery.data?.username,
					action_type: "update",
					target_type: "task",
					target_id: taskId,
					content: taskTitle
				})
			
			if (logError) throw logError;
		},

		onSuccess: (_, { groupId }) => {

			queryClient.invalidateQueries({
				queryKey: ["tasks", groupId],
			});

			queryClient.invalidateQueries({
				queryKey: ["user_tasks", groupId],
			});
		}
	})
}

//更新任務成員
export function useUpdateTaskMembers() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			taskId,
			groupId,
			newUserIds,
			currentUserIds,
		}: UpdateTaskMembersInput) => {
			const toDelete = currentUserIds.filter(
				id => !newUserIds.includes(id)
			)

			const toInsert = newUserIds.filter(
				id => !currentUserIds.includes(id)
			)

			if (toDelete.length > 0) {
				const { error } = await supabase
					.from("task_members")
					.delete()
					.eq("task_id", taskId)
					.in("user_id", toDelete)

				if (error) throw error;
			}

			if (toInsert.length > 0) {
				const { error } = await supabase
					.from("task_members")
					.insert(
						toInsert.map(userId => ({
							group_id: groupId,
							task_id: taskId,
							user_id: userId
						}))
					);

				if (error) throw error;
			}
		},

		onSuccess: (_, { taskId }) => {
			queryClient.invalidateQueries({
				queryKey: ["tasks", taskId, "members"],
			});
		}
	})
}

export function useFinishTask() {
	const profileQuery = useProfile();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			taskId,
			groupId,
		}: FinishTaskInput) => {
			const { data, error } = await supabase
				.from("task")
				.update({
					status: "finished",
				})
				.eq("id", taskId)
				.select("title")
				.single();

			if (error) throw error;

			const { error: logError } = await supabase
				.from("group_logs")
				.insert({
					group_id: groupId,
					user_id: profileQuery.data?.user_id,
					username: profileQuery.data?.username,
					action_type: "finish",
					target_type: "task",
					target_id: taskId,
					content: data.title
				})

			if (logError) throw logError;
		},

		onSuccess: (_, { groupId }) => {
			queryClient.invalidateQueries({
				queryKey: ["tasks", groupId],
			});

			queryClient.invalidateQueries({
				queryKey: ["user_tasks", groupId],
			});
		}
	})
}