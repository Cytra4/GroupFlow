import { supabase } from "@/lib/supabase/client";
import { Group } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

export function useUserGroups(userId?: string) {
	return useQuery<Group[], Error>({
		queryKey: ["groups"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("group_members")
				.select("groups(*)") // join groups table
				.eq("user_id", userId);

			if (error) throw error;
			if (!data) return [];

			// Each row looks like { groups: { ...Group } }
			return data.flatMap((gm) => gm.groups as Group[]);
		},
		enabled: !!userId, // only run if userId is available
	});
}

export function useGroup(groupId?: string) {
	return useQuery<Group | null, Error>({
		queryKey: ["group", groupId],

		enabled: !!groupId,

		queryFn: async () => {
			const { data, error } = await supabase
				.from("groups")
				.select("*")
				.eq("id", groupId)
				.single();

			if (error) throw error;

			return data;
		},
	});
}