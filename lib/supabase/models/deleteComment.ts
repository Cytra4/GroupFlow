import { supabase } from "@/lib/supabase/client";

export async function deleteComment(commentId: number) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) throw error;
  return true;
}

export async function deleteDiscussion(discussionId: number) {
  
  const { error: deleteCommentsError } = await supabase
    .from("comments")
    .delete()
    .eq("discussion_id", discussionId);

  if (deleteCommentsError) throw deleteCommentsError;

  const { error: deleteDiscussionError } = await supabase
    .from("discussions")
    .delete()
    .eq("id", discussionId);

  if (deleteDiscussionError) throw deleteDiscussionError;
  return true;
}
