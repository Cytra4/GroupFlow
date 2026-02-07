import { useAddComment, useComments } from "@/lib/supabase/models/comments";
import {
	Discussion,
	useAddDiscussion,
	useDiscussions,
} from "@/lib/supabase/models/discussions";
import { useGlobalSearchParams } from "expo-router";
import React, { useState } from "react";
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
      <Text style={styles.header}>討論區</Text>

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
        <Button title="新增討論" onPress={handleAdd} disabled={isPending} />
      </View>

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

// 子元件：每個討論卡片 + 回覆區
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

  const handleAddReply = () => {
    if (!replyText.trim()) return;
    addComment(discussion.id, replyText);
    setReplyText("");
    refetch();
  };

  return (
    <View style={styles.card}>
      <Text onPress={onToggle} style={styles.title}>
        {discussion.title}
      </Text>
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
              <Text style={{ fontSize: 10, color: "#888" }}>
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
  background: "#f2f5f8",
  surface: "#ffffff",
  primaryText: "#111827",
  secondaryText: "#6b7280",
  border: "#e2e8f0",
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
    fontWeight: "800",
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
    fontWeight: "700",
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
