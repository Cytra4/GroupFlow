import { useAddDiscussion } from "@/lib/supabase/models/discussions";
import { useState } from "react";
import { Button, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type AddDiscussionProps = {
  groupId?: string;
  visible: boolean;
  onClose: () => void;
  onAdded?: () => void;
};

export default function AddDiscussion({
  groupId,
  visible,
  onClose,
  onAdded,
}: AddDiscussionProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { addDiscussion, isPending } = useAddDiscussion();

  const handleClose = () => {
    setTitle("");
    setContent("");
    onClose();
  };

  const handleSubmit = () => {
    if (!groupId || !title.trim() || !content.trim()) return;
    addDiscussion(groupId, title, content);
    setTitle("");
    setContent("");
    onAdded?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.modalView} onPress={() => null}>
          <Text style={styles.modalTitle}>新增討論</Text>
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
            style={[styles.input, styles.textarea]}
            multiline
          />
          <View style={styles.buttonRow}>
            <Button title="取消" onPress={handleClose} />
            <Button title="送出" onPress={handleSubmit} disabled={isPending} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalView: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#141f94",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    fontSize: 16,
    color: "#111827",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});