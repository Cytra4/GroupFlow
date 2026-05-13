import { useUserTasks } from '@/lib/hooks/useTask';
import { useAvatarUpload } from "@/lib/hooks/utils/useAvatarUpload";
import { useAddDiscussion } from "@/lib/supabase/models/discussions";
import { useAuth } from "@/scripts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
	Image,
	Modal,
	Pressable,
	ScrollView,
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
  const [imageUri, setImageUri] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { addDiscussion, isPending } = useAddDiscussion();
  const { data: taskData = [] } = useUserTasks(groupId ?? "");
  const { user } = useAuth();

  const handleClose = () => {
    setTitle("");
    setContent("");
    setSelectedTaskIds([]);
    setImageUri("");
    setIsUploading(false);
    onClose();
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!groupId || !title.trim() || !content.trim()) return;

    try {
      setIsUploading(true);
      let avatarUrl: string | undefined;

      // Upload image if selected
      if (imageUri && user) {
        avatarUrl = await useAvatarUpload(
          imageUri,
          `discussion_${Date.now()}`
        );
      }

      const selectedTasks = taskData
        .filter((task) => selectedTaskIds.includes(task.id))
        .map((task) => task.title);

      const finalContent = selectedTasks.length
        ? `${content.trim()}\n\n相關任務：\n- ${selectedTasks.join("\n- ")}`
        : content.trim();

      addDiscussion(groupId, title.trim(), finalContent, avatarUrl);
      setTitle("");
      setContent("");
      setSelectedTaskIds([]);
      setImageUri("");
      onAdded?.();
    } finally {
      setIsUploading(false);
    }
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
          <ScrollView>
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

            {/* Image Upload Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>添加圖片</Text>
              {imageUri ? (
                <View>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                  />
                  <Pressable
                    style={styles.removeImageButton}
                    onPress={() => setImageUri("")}
                  >
                    <Text style={styles.removeImageText}>移除圖片</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.uploadImageButton}
                  onPress={handlePickImage}
                >
                  <Text style={styles.uploadImageText}>選擇圖片</Text>
                </Pressable>
              )}
            </View>

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
                style={[
                  styles.submitButton,
                  (isPending || isUploading) && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isPending || isUploading}
              >
                <Text style={styles.submitLabel}>
                  {isUploading ? "上傳中..." : "送出"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
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
    maxHeight: "90%",
	boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
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
  imageSection: {
    marginBottom: 18,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  uploadImageButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  uploadImageText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  removeImageButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  removeImageText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
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