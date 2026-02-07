import { useAuth } from "@/scripts/AuthContext";
import { Discussion } from "@/types/supabase";
import { useFetch, useInsert } from "../query";

export function useDiscussions(groupId: string | undefined) {
  const { data, isLoading, refetch } = useFetch<Discussion>("discussions", {
    select: `
      id,
      group_id,
      title,
      content,
      status,
      created_at,
      profiles (
        username
      )
    `,
    filter: groupId ? { group_id: groupId } : undefined,
    order: [{ column: "created_at", ascending: false }],
  });
  return { discussions: data, isLoading, refetch };
}

export function useAddDiscussion() {
  const { user } = useAuth();
  const insertMutation = useInsert();

  const addDiscussion = (groupId: string, title: string, content: string) => {
    if (!user) return;

    insertMutation.mutate({
      table: "discussions",
      row: {
        group_id: groupId,
        title,
        content,
        status: true,
        user_id: user.id,
      },
    });
  };

  return { addDiscussion, isPending: insertMutation.isPending };
}
