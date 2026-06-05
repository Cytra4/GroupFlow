import LogDisplay from '@/components/LogDisplay';
import { DialogRef } from '@/components/UI/BaseDialog';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog';
import { useProfileQuery } from '@/lib/hooks/auth/profile';
import { useDeleteGroupMutation, useLeaveGroupMutation } from '@/lib/hooks/idk/group';
import { useGroup } from '@/lib/hooks/idk/useGroups';
import { useGroupLogs } from '@/lib/hooks/useGroupLogs';
import { useGroupMembers } from '@/lib/hooks/useGroupMembers';
import { UserRole } from '@/types/supabase';
import { Tabs, useGlobalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Information() {
    const router = useRouter();

    const { groupId } = useGlobalSearchParams<{ groupId: string }>();
    const { data: groupData } = useGroup(groupId);
    const { data: logData } = useGroupLogs(groupId);
    const { data: groupMembers, isPending: isGroupMembersPending } = useGroupMembers(groupId);
    const creator = groupMembers?.find(
        m => m.user_id === groupData?.created_by
    )
    const { data: profile } = useProfileQuery();

    const leaveGroup = useLeaveGroupMutation();
    const deleteGroup = useDeleteGroupMutation();
    const leaveDialogRef = React.useRef<DialogRef>(null);
    const deleteDialogRef = React.useRef<DialogRef>(null);

    function handleLeaveGroup() {
        leaveGroup.mutate(groupId, {
            onSuccess: () => {
                router.back();
                if (groupData?.member_count === 1) {
                    deleteGroup.mutate(groupId);
                }
            }
        });
    }

    if (!isGroupMembersPending) {
        console.log(groupMembers);
    }

    return (<>
        <Tabs.Screen
            options={{
                headerRight: () => (profile?.role !== UserRole.Admin) ? (<>
                    <Pressable onPress={leaveDialogRef.current?.open}>
                        <Text style={styles.leaveText}>
                            離開小組
                        </Text>
                    </Pressable>
                    <ConfirmDialog
                        ref={leaveDialogRef}
                        confirmText="離開"
                        onConfirm={handleLeaveGroup}
                    >
                        <Text style={styles.leaveTextConfirm}>
                            確定要離開小組嗎？
                        </Text>
                    </ConfirmDialog>
                </>) : (<>
                    <Pressable onPress={deleteDialogRef.current?.open}>
                        <Text style={styles.leaveText}>
                            刪除小組
                        </Text>
                    </Pressable>
                    <ConfirmDialog
                        ref={deleteDialogRef}
                        confirmText="刪除"
                        onConfirm={handleLeaveGroup}
                    >
                        <Text style={styles.leaveTextConfirm}>
                            確定要刪除小組嗎？
                        </Text>
                    </ConfirmDialog>
                </>)
            }}
        />

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>小組資訊</Text>
                <View style={styles.section}>
                    <View style={styles.sectionContent}>
                        <Text style={styles.label}>小組名稱</Text>
                        <Text style={styles.title}>{groupData?.name}</Text>
                    </View>
                    <View style={styles.line} />
                    <View style={styles.sectionContent}>
                        <Text style={styles.label}>加入代碼</Text>
                        <Text style={styles.title}>{groupData?.join_code}</Text>
                    </View>
                    <View style={styles.line} />
                    <View style={styles.sectionContent}>
                        <Text style={styles.label}>建立者</Text>
                        <Text style={styles.title}>{creator?.profiles.username}</Text>
                    </View>
                    <View style={styles.line} />
                    <View style={styles.sectionContent}>
                        <Text style={styles.label}>小組人數</Text>
                        <Text style={styles.title}>{groupData?.member_count}</Text>
                    </View>
                    <View style={styles.line} />
                    <View style={styles.sectionContent}>
                        <Text style={[styles.label, { alignSelf: 'flex-start' }]}>小組成員</Text>
                        <View style={styles.memberGrid}>
                            {groupMembers?.map((m) => (
                                <View key={m.id} style={styles.memberItem}>
                                    <Image source={{ uri: m.profiles.avatarUrl || 'https://picsum.photos/200' }} style={styles.profilePic} />
                                    <Text style={styles.memberName}>{m.profiles.username}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>活動紀錄</Text>
                <View style={styles.section}>
                    <ScrollView style={styles.logScroll} nestedScrollEnabled={true}>
                        {logData?.map((log) => (
                            <View key={log.id} style={styles.logItemInner}>
                                <LogDisplay logData={log} isGroupRelated={log.target_type == 'group'} />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </ScrollView>
    </>);
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#f2f5f8',
    },
    content: {
        width: '85%',
    },
    section: {
        backgroundColor: 'white',
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: '#bfc9d1',
        borderRadius: 6
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 16,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    sectionContent: {
        paddingHorizontal: 15,
    },
    label: {
        color: 'gray',
        marginBottom: 3,
        fontSize: 14
    },
    title: {
        fontSize: 16
    },
    line: {
        width: '100%',
        borderTopWidth: 1,
        borderColor: '#bfc9d1',
        marginVertical: 10,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8
    },
    memberGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        justifyContent: 'flex-start'
    },
    memberItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 12,
    },
    memberName: {
        marginTop: 6,
        textAlign: 'center',
        fontSize: 12,
    },
    leaveText: {
        color: 'coral',
        fontSize: 20,
        marginRight: 10,
        fontWeight: 'bold',
    },
    leaveTextConfirm: {
        color: '#E43636',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    logScroll: {
        maxHeight: 300,
    },
    logItemInner: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#eee'
    },
    logSectionPlaceholder: {
        minHeight: 12,
        borderWidth: 0,
    }
});
