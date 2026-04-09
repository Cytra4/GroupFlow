import { useAvatarUpload } from "@/lib/hooks/utils/useAvatarUpload";
import { supabase } from "@/lib/supabase/client";
import { useAddComment, useComments } from "@/lib/supabase/models/comments";
import { Discussion } from "@/types/supabase";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
	Image,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

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
  const [replyImageUri, setReplyImageUri] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState("");
  const uploadavatar = replyImageUri ? useAvatarUpload(
    replyImageUri,
    `comment_${discussion.id}_${Date.now()}`,
  ) : null;

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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReplyImageUri(result.assets[0].uri);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim() && !replyImageUri) return;

    let avatarUrl: string | undefined;
    if (replyImageUri && uploadavatar) {
      avatarUrl = await uploadavatar;
    }

    addComment(discussion.id, replyText.trim() || null, avatarUrl);
    setReplyText("");
    setReplyImageUri("");
    refetch();
  };
  const openImageModal = (uri: string) => {
    setSelectedImageUri(uri);
    setModalVisible(true);
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
              {comment.avatarUrl ? (
                <TouchableOpacity
                  onPress={() => openImageModal(comment.avatarUrl!)}
                >
                  <Image
                    source={{ uri: comment.avatarUrl }}
                    style={styles.commentImage}
                  />
                </TouchableOpacity>
              ) : null}
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
          <View style={styles.uploadRow}>
            <Pressable style={styles.uploadButton} onPress={handlePickImage}>
              <Text style={styles.ButtonText}>選擇圖片</Text>
            </Pressable>
            {replyImageUri ? (
              <Pressable
                style={styles.cancelButton}
                onPress={() => setReplyImageUri("")}
              >
                <Text>移除圖片</Text>
              </Pressable>
            ) : null}
          </View>
          {replyImageUri ? (
            <TouchableOpacity onPress={() => openImageModal(replyImageUri)}>
              <Image
                source={{ uri: replyImageUri }}
                style={styles.replyPreview}
              />
            </TouchableOpacity>
          ) : null}
          <Pressable style={styles.submitButton} onPress={handleAddReply}>
            <Text style={styles.ButtonText}>送出回覆</Text>
          </Pressable>
        </View>
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
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
    padding: 15,
    marginBottom: 8,
  },
  uploadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  replyPreview: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  commentImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 6,
    resizeMode: "contain",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "90%",
  },
  uploadButton: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    fontWeight: "700",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    fontWeight: "700",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  submitButton: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    fontWeight: "700",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 16,
  },
  ButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
