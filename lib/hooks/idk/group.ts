
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileQuery } from "../auth/profile";
import { useUserQuery } from "../auth/user";

export function useLeaveGroupMutation() {
	const { data: user } = useUserQuery();
	const profileQuery = useProfileQuery();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (groupId: string) => {
			if (!user) throw new Error("User not found");

			const { error } = await supabase
				.from("group_members")
				.delete()
				.eq("group_id", groupId)
				.eq("user_id", user!.id);
			if (error) throw error;

			const { error: LogError } = await supabase
				.from("group_logs")
				.insert({
					group_id: groupId,
					user_id: user.id,
					username: profileQuery.data?.username,
					action_type: "leave",
					target_type: "group",
					target_id: groupId,
					content: ""
				})
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["group_members"] });

			qc.invalidateQueries({ queryKey: ["group_logs"]});
		}
	});
}

export function useDeleteGroupMutation() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (groupId: string) => {
			const { error } = await supabase
				.from("groups")
				.delete()
				.eq("id", groupId);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["groups"] });
		}
	});
}