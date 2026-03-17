import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
export type GroupMember = {
	id: string;
	group_id: string;
	user_id: string;
	joined_at: string;
	profiles: {
		user_id: string;
		username: string;
		avatarUrl: string;
	}[];
};

export function useGroupMembers(groupId: string) {
	return useQuery<GroupMember[], Error>({
		queryKey: ["group-members", groupId],
		enabled: !!groupId,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("group_members")
				.select(` 
				id, 
				group_id, 
				user_id, 
				joined_at, 
				profiles( 
					user_id, 
					username,
					avatarUrl
				) 
				`)
				.eq("group_id", groupId)
				.order("joined_at", { ascending: true });
			if (error) throw error;
			return data ?? [];
		},
	}
	);
}