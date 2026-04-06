import { Task } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useTask(group_id: string) {
	return useQuery<Task[], Error>({
		queryKey: ["tasks", group_id],
		enabled: !!group_id,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("task")
				.select("*")
				.eq("group_id", group_id)
				.order("start_date", { ascending: true });

			if (error) throw error;
			return data ?? [];
		},
	});
}

export function useUserTasks(group_id: string) {
	return useQuery<Task[], Error>({
		queryKey: ["tasks", group_id],
		enabled: !!group_id,
		queryFn: async () => {

			const { data: { user } } = await supabase.auth.getUser();

			const { data, error } = await supabase
				.from("task")
				.select(`
					*,
					task_members!inner(user_id)
				`)
				.eq("group_id", group_id)
				.eq("task_members.user_id", user?.id)
				.order("start_date", { ascending: true });

			if (error) throw error;

			return data ?? [];
		},
	});
}