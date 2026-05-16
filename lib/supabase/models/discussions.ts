import { useProfileQuery } from "@/lib/hooks/auth/profile";
import { useAuth } from "@/scripts/AuthContext";
import { Discussion } from "@/types/supabase";
import { useFetch, useInsert } from "../query";

export function useDiscussions(groupId: string | undefined) {
	const { data, isLoading, refetch } = useFetch<Discussion>("discussions", {
		select: `
      id,
      group_id,
      user_id,
      title,
      content,
      status,
      created_at,
	  avatarUrl,
      profiles (
        username,
        avatarUrl
      )
    `,
		filter: groupId ? { group_id: groupId } : undefined,
		order: [{ column: "created_at", ascending: false }],
	});
	return { discussions: data, isLoading, refetch };
}

export function useAddDiscussion() {
	const { user } = useAuth();
	const profileQuery = useProfileQuery();
	const insertMutation = useInsert<Discussion>();

	const addDiscussion = async (
		groupId: string,
		title: string,
		content: string,
		avatarUrl?: string
	) => {

		if (!user) return;

		const result = await insertMutation.mutateAsync({
			table: "discussions",
			row: {
				group_id: groupId,
				title,
				content,
				status: true,
				user_id: user.id,
				avatarUrl,
			},
		});

		const newDiscussion = result[0];

		await insertMutation.mutateAsync({
			table: "group_logs",
			row: {
				group_id: groupId,
				user_id: profileQuery.data?.user_id,
				username: profileQuery.data?.username,
				action_type: "create",
				target_type: "discussion",
				target_id: newDiscussion.id,
				content: title,
			}
		});

	};

	return {
		addDiscussion,
		isPending: insertMutation.isPending
	};
}
