import AddDiscussionModal from "@/components/forum/addDiscussion";
import DiscussionCard from "@/components/forum/DiscussionCard";
import { useDiscussions } from "@/lib/supabase/models/discussions";
import { useGlobalSearchParams } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Forum() {
  const { groupId } = useGlobalSearchParams<{ groupId: string }>();
  const { discussions, isLoading, refetch } = useDiscussions(groupId);

  const [showForm, setShowForm] = useState(false);
  const [openDiscussionId, setOpenDiscussionId] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "flex-end", marginBottom: 16 }}>
        <Text onPress={() => setShowForm(true)} style={styles.addButton}>
          + 新增討論
        </Text>
      </View>

      <AddDiscussionModal
        groupId={groupId}
        visible={showForm}
        onClose={() => setShowForm(false)}
        onAdded={refetch}
      />

      {isLoading ? (
        <Text>載入中...</Text>
      ) : (
        <FlatList
          data={discussions}
          keyExtractor={(item) => item.id.toString()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f2f5f8",
  },
  addButton: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    fontWeight: "600",
  },
});