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

      <View style={styles.newBox}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f2f5f8", 
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937", // 深色字體
    marginBottom: 16,
  },
  newBox: {
    marginBottom: 24,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, 
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
    color: "#111827",
  },
  time: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280", // 中灰色
  },
});
