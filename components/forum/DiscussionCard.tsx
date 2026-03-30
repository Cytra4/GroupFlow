import { supabase } from "@/lib/supabase/client";
import { useAddComment, useComments } from "@/lib/supabase/models/comments";
import { Discussion } from "@/types/supabase";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{discussion.title}</Text>
      <Text style={styles.content}>{discussion.content}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {discussion.profiles?.username ?? "匿名"}
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontWeight: "400",
    fontSize: 18,
    marginBottom: 4,
    color: "#111827",
    lineHeight: 24,
  },
  content: {
    color: "#374151",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  time: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  toggleText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 14,
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