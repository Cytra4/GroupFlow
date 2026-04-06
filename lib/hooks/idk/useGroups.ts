import { supabase } from "@/lib/supabase/client";
import { Group, UserRole } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { useProfileQuery } from "../auth/profile";

export function useUserGroups() {
	const { data: profile } = useProfileQuery();

	return useQuery<Group[], Error>({
		queryKey: ["groups"],
		enabled: !!profile,
		queryFn: async () => {
			switch (profile!.role) {
				case UserRole.Admin: {
					const { data, error } = await supabase.from("groups").select("*");
					if (error) throw error;
					return data;
				}
				default: {
					const { data, error } = await supabase
						.from("group_members")
						.select("groups(*)")
						.eq("user_id", profile!.user_id);
					if (error) throw error;
					return data.flatMap((gm) => gm.groups as Group[]);
				}
			}
		},
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