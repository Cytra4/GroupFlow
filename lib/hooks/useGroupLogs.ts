import { Group_Logs } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useGroupLogs(group_id: string) {
	return useQuery<Group_Logs[], Error>({
		queryKey: ["group_logs", group_id],
		enabled: !!group_id,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("group_logs")
				.select("*")
				.eq("group_id", group_id)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data ?? [];
		},
	});
}