import { useAuth } from "@/scripts/AuthContext";
import { useFetch, useInsert } from "../query";

export type Discussion = {
  id: number;
  group_id: string;
  user_id: string;
  title: string;
  content: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export function useDiscussions(groupId: string | undefined) {
  const { data, isLoading, refetch } = useFetch<Discussion>("discussions", {
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
