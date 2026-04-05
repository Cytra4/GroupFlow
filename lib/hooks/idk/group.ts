
import { supabase } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useUserQuery } from "../auth/user";

export function useLeaveGroupMutation() {
	const user = useUserQuery().data;

	return useMutation({
		mutationFn: async (groupId: string) => {
			const { error } = await supabase
				.from("group_members")
				.delete()
				.eq("group_id", groupId)
				.eq("user_id", user!.id);
			if (error) throw error;
		},
	});
}