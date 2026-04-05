import { useUserTasks } from '@/lib/hooks/useTask';
import { useAddDiscussion } from "@/lib/supabase/models/discussions";
import { useState } from "react";
import {
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

type AddDiscussionProps = {
  groupId?: string;
  visible: boolean;
  onClose: () => void;
  onAdded?: () => void;
};

const taskColors = [
  {
    borderColor: "#60a5fa",
    backgroundColor: "#eff6ff",
    selectedBorder: "#2563eb",
    selectedBackground: "#bfdbfe",
    checkboxColor: "#2563eb",
  },
  {
    borderColor: "#34d399",
    backgroundColor: "#ecfdf5",
    selectedBorder: "#059669",
    selectedBackground: "#bbf7d0",
    checkboxColor: "#059669",
  },
  {
    borderColor: "#fbbf24",
    backgroundColor: "#fef3c7",
    selectedBorder: "#f59e0b",
    selectedBackground: "#fde68a",
    checkboxColor: "#d97706",
  },
  {
    borderColor: "#f472b6",
    backgroundColor: "#fce7f3",
    selectedBorder: "#db2777",
    selectedBackground: "#fbcfe8",
    checkboxColor: "#be185d",
  },
  {
    borderColor: "#8b5cf6",
    backgroundColor: "#eef2ff",
    selectedBorder: "#7c3aed",
    selectedBackground: "#ddd6fe",
    checkboxColor: "#7c3aed",
  },
];

export default function AddDiscussion({
  groupId,
  visible,
  onClose,
  onAdded,
}: AddDiscussionProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const { addDiscussion, isPending } = useAddDiscussion();
  const { data: taskData = [] } = useUserTasks(groupId ?? "");

  const handleClose = () => {
    setTitle("");
    setContent("");
    setSelectedTaskIds([]);
    onClose();
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleSubmit = () => {
    if (!groupId || !title.trim() || !content.trim()) return;

    const selectedTasks = taskData
      .filter((task) => selectedTaskIds.includes(task.id))
      .map((task) => task.title);

    const finalContent = selectedTasks.length
      ? `${content.trim()}\n\n相關任務：\n- ${selectedTasks.join("\n- ")}`
      : content.trim();

    addDiscussion(groupId, title.trim(), finalContent);
    setTitle("");
    setContent("");
    setSelectedTaskIds([]);
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

          <View style={styles.taskSection}>
            <Text style={styles.sectionTitle}>選擇相關任務</Text>
            {taskData.length === 0 ? (
              <Text style={styles.emptyText}>沒有可用任務</Text>
            ) : (
              taskData.map((task, index) => {
                const selected = selectedTaskIds.includes(task.id);
                const colors = taskColors[index % taskColors.length];
                return (
                  <Pressable
                    key={task.id}
                    style={[
                      styles.taskItem,
                      {
                        borderColor: selected
                          ? colors.selectedBorder
                          : colors.borderColor,
                        backgroundColor: selected
                          ? colors.selectedBackground
                          : colors.backgroundColor,
                      },
                    ]}
                    onPress={() => handleToggleTask(task.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && {
                          backgroundColor: colors.checkboxColor,
                          borderColor: colors.selectedBorder,
                        },
                      ]}
                    />
                    <Text style={styles.taskText}>{task.title}</Text>
                  </Pressable>
                );
              })
            )}
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelLabel}>取消</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, isPending && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isPending}
            >
              <Text style={styles.submitLabel}>送出</Text>
            </Pressable>
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
    padding: 20,
  },
  modalView: {
    backgroundColor: "#f7fafc",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#111827",
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  taskSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 10,
    fontWeight: "600",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    paddingVertical: 10,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  taskItemSelected: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#9ca3af",
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  taskText: {
    color: "#111827",
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.65,
  },
  cancelLabel: {
    color: "#374151",
    fontWeight: "700",
  },
  submitLabel: {
    color: "#ffffff",
    fontWeight: "700",
  },
});