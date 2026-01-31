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
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>{item.content}</Text>
              <Text style={styles.time}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// 1. 定義設計規範 (Design Tokens)
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

// 2. 抽離共用樣式 (Mixins)
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
