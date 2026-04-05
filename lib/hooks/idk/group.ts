
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserQuery } from "../auth/user";

export function useLeaveGroupMutation() {
	const { data: user } = useUserQuery();
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
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["group_members"] });
		}
	});
}