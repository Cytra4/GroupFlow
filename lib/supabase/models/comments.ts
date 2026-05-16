import { useAuth } from "@/scripts/AuthContext";
import { Comment } from "@/types/supabase";
import { useFetch, useInsert } from "../query";

export function useComments(discussionId: number) {
  const { data, isLoading, refetch } = useFetch<Comment>("comments", {
    select: `
      id,
      discussion_id,
      user_id,
      content,
      avatarUrl,
      created_at,
      profiles (
        username
      )
    `,
    filter: { discussion_id: discussionId },
    order: [{ column: "created_at", ascending: true }],
  });

  return { comments: data ?? [], isLoading, refetch };
}

export function useAddComment() {
  const insertMutation = useInsert();
  const { user } = useAuth();

  const addComment = (
    discussionId: number,
    content: string | null,
    avatarUrl?: string,
  ) => {
    insertMutation.mutate({
      table: "comments",
      row: {
        discussion_id: discussionId,
        user_id: user?.id,
        content,
        avatarUrl: avatarUrl,
        status: true,
      },
    });
  };

  return {
    addComment,
    isPending: insertMutation.isPending,
    error: insertMutation.error,
  };
}
