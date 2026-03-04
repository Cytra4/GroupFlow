import { supabase } from "@/lib/supabase/client";
import { useAddComment, useComments } from "@/lib/supabase/models/comments";
import {
	useAddDiscussion,
	useDiscussions,
} from "@/lib/supabase/models/discussions";
import { Discussion } from "@/types/supabase";
import { useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Button,
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

export default function Forum() {
  const { groupId } = useGlobalSearchParams<{ groupId: string }>();
  const { discussions, isLoading, refetch } = useDiscussions(groupId);
  const { addDiscussion, isPending } = useAddDiscussion();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [openDiscussionId, setOpenDiscussionId] = useState<number | null>(null);

  const handleAdd = () => {
    if (!title || !content || !groupId) return;
    addDiscussion(groupId, title, content);
    setTitle("");
    setContent("");
    refetch();
  };

  return (
    <View style={styles.container}>
      {!showForm && (
        <View style={{ alignItems: "flex-end", marginBottom: 16 }}>
          <Text
            onPress={() => setShowForm(true)}
            style={{
              backgroundColor: "#4f46e5",
              color: "#fff",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              fontWeight: "600",
            }}
          >
            + 新增討論
          </Text>
        </View>
      )}
      {showForm && (
        <View style={styles.boxBase}>
          <TextInput
            placeholder="標題"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="內容"
            value={content}
            onChangeText={setContent}
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Button
              title="取消"
              onPress={() => {
                setShowForm(false);
                setTitle("");
                setContent("");
              }}
            />
            <Button
              title="送出"
              onPress={() => {
                handleAdd();
                setShowForm(false);
              }}
              disabled={isPending}
            />
          </View>
        </View>
      )}
      {isLoading ? (
        <Text>載入中...</Text>
      ) : (
        <FlatList
          data={discussions}
          keyExtractor={(item: Discussion) => item.id.toString()}
          renderItem={({ item }) => (
            <DiscussionCard
              discussion={item}
              isOpen={openDiscussionId === item.id}
              onToggle={() =>
                setOpenDiscussionId(
                  openDiscussionId === item.id ? null : item.id,
                )
              }
            />
          )}
        />
      )}
    </View>
  );
}

function DiscussionCard({
  discussion,
  isOpen,
  onToggle,
}: {
  discussion: Discussion;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { comments, refetch } = useComments(discussion.id);

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
  }, [discussion.id]);

  const handleAddReply = () => {
    if (!replyText.trim()) return;
    addComment(discussion.id, replyText);
    setReplyText("");
    refetch();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{discussion.title}</Text>
      <Text>{discussion.content}</Text>

      <View
        style={{
          marginTop: 8,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 12, color: "#6b7280" }}>
          {discussion.profiles?.username ?? "匿名"}
        </Text>
        <Text style={styles.time}>
          {new Date(discussion.created_at).toLocaleString()}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", marginTop: 6 }}>
        <Text
          onPress={onToggle}
          style={{
            color: "#4f46e5",
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          {isOpen ? "收合回覆" : `${comments?.length ?? 0} 則回覆`}
        </Text>
      </View>

      {/* reply */}
      {isOpen && (
        <View
          style={{
            marginTop: 12,
            borderTopWidth: 1,
            borderColor: "#eee",
            paddingTop: 8,
          }}
        >
          {comments.map((c) => (
            <View key={c.id} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                {c.profiles?.username ?? "匿名"}
              </Text>
              <Text>{c.content}</Text>
              <Text style={{ fontSize: 10, color: "#8d5353" }}>
                {new Date(c.created_at).toLocaleString()}
              </Text>
            </View>
          ))}

          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder="輸入回覆..."
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              padding: 6,
              marginTop: 8,
            }}
          />

          <Button title="送出回覆" onPress={handleAddReply} />
        </View>
      )}
    </View>
  );
}

// --- 你原本的樣式保留 ---
const COLORS = {
  background: "#cfd7db",
  surface: "#ffffff",
  primaryText: "#111827",
  secondaryText: "#6b7280",
  border: "#141f94",
  inputBg: "#f9fafb",
  shadow: "#000",
};

const SPACING = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

const commonStyles = {
  shadow: {
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  rounded: {
    borderRadius: 12,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: 26,
    fontWeight: "400",
    color: COLORS.primaryText,
    marginBottom: SPACING.lg,
    letterSpacing: -0.5,
  },

  boxBase: {
    ...commonStyles.shadow,
    ...commonStyles.rounded,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.inputBg,
    fontSize: 16,
    color: COLORS.primaryText,
  },
  card: {
    ...commonStyles.shadow,
    ...commonStyles.rounded,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontWeight: "400",
    fontSize: 18,
    marginBottom: 4,
    color: COLORS.primaryText,
    lineHeight: 24,
  },
  time: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.secondaryText,
    fontWeight: "500",
  },
});
