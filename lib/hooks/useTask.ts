import { Task } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useTask(group_id: string) {
	return useQuery<Task[], Error>({
		queryKey: ["task", group_id],
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