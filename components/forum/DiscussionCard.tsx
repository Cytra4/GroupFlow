import { supabase } from "@/lib/supabase/client";
import { useAddComment, useComments } from "@/lib/supabase/models/comments";
import { Discussion } from "@/types/supabase";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

const borderColors = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#8b5cf6",
  "#fb7185",
  "#22c55e",
];

type DiscussionCardProps = {
  discussion: Discussion;
  isOpen: boolean;
  onToggle: () => void;
};

export default function DiscussionCard({
  discussion,
  isOpen,
  onToggle,
}: DiscussionCardProps) {
  const { comments = [], refetch } = useComments(discussion.id);
  const { addComment } = useAddComment();
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${discussion.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `discussion_id=eq.${discussion.id}`,
        },
        () => {
          refetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [discussion.id, refetch]);

  const handleAddReply = () => {
    if (!replyText.trim()) return;
    addComment(discussion.id, replyText);
    setReplyText("");
    refetch();
  };

  const borderColor =
    borderColors[Number(discussion.id) % borderColors.length] ??
    borderColors[0];

  return (
    <View style={[styles.card, { borderColor }]}>
      <Text style={styles.title}>{discussion.title}</Text>
      <Text style={styles.content}>{discussion.content}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          討論發起人：{discussion.profiles?.username ?? "匿名"}
        </Text>
        <Text style={styles.time}>
          {new Date(discussion.created_at).toLocaleString()}
        </Text>
      </View>
      <Text onPress={onToggle} style={styles.toggleText}>
        {isOpen ? "收合回覆" : `${comments.length} 則回覆`}
      </Text>

      {isOpen && (
        <View style={styles.replySection}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentRow}>
              <Text style={styles.commentAuthor}>
                {comment.profiles?.username ?? "匿名"}
              </Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <Text style={styles.commentTime}>
                {new Date(comment.created_at).toLocaleString()}
              </Text>
            </View>
          ))}

          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder="輸入回覆..."
            style={styles.replyInput}
          />
          <Button title="送出回覆" onPress={handleAddReply} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontWeight: "400",
    fontSize: 24,
    marginBottom: 4,
    color: "#111827",
    lineHeight: 24,
  },
  content: {
	fontSize: 20,
    color: "#111827",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaText: {
    lineHeight: 24,
    fontSize: 16,
    color: "#111827",
  },
  time: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  toggleText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 20,
    marginBottom: 12,
    textAlign: "right",
  },
  replySection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 8,
  },
  commentRow: {
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "bold",
  },
  commentContent: {
    marginTop: 2,
    marginBottom: 2,
    color: "#374151",
  },
  commentTime: {
    fontSize: 10,
    color: "#8d5353",
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
});