import { Button } from '@/components/Button';
import { GroupCard } from '@/components/GroupCard';
import { useGroups } from '@/lib/hooks/idk/useGroups';
import { useSignOut } from '@/lib/supabase/auth';
import { useProfile } from '@/lib/supabase/models/profile';
import { useInsert } from '@/lib/supabase/query';
import { wp } from '@/scripts/constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function Index() {
    const router = useRouter();

    const signOutMutation = useSignOut();
    const profileQuery = useProfile();
    
    const groupInsertMutation = useInsert();

    const { data: userGroups } = useGroups(profileQuery.data?.user_id || '');

    // console.log('User Groups:', userGroups);

    //根據小組名稱生成header顏色
    function GenColorFromName(group_name: string) {
        let hash = 0;
        for (let i = 0; i < group_name.length; i++) {
            hash = group_name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    if (profileQuery.data) {
        console.log('Logged in as:', profileQuery.data, 'Profile:', profileQuery.data);
    }

    return (
        <View style={styles.container}>
            <Text>名稱：{profileQuery.data?.username}</Text>
            <Text>權限：{profileQuery.data?.role === 'user' ? '一般使用者' : profileQuery.data?.role === 'admin' ? '管理員' : "未知"}</Text>
            <Text
                onPress={() => signOutMutation.mutate()}
                style={{ fontSize: 20 }}
            >
                登出
            </Text>
            <Button
                title='Add Group'
                onPress={() => {
                    groupInsertMutation.mutate({
                        table: 'groups', row: {
                            name: `By ${profileQuery.data?.username}`,
                            created_by: profileQuery.data?.user_id
                        }
                    });
                }}
                loading={groupInsertMutation.isPending}
            />

            <FlatList
                data={userGroups}
                style={{ width: wp(80) }}
                keyExtractor={(group) => group.id}
                renderItem={({ item }) => (
                    <GroupCard
                        group_name={item.name}
                        member_counts={item.member_count}
                        created_at={new Date(item.created_at)}
                        headerColor={GenColorFromName(item.name)}
                        onPress={() => {
                            router.replace({
                                pathname: '/groups/[groupId]/calendar',
                                params: { groupId: item.id },
                            });
                        }
                        }
                    />
                )}
            />

            {/* <FlatList
					data={groups}
					keyExtractor={(group) => group.id}
					renderItem={({ item }) => (
						<View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
							<Pressable onPress={() => eventBus.emit('openJoinGroup', item.join_code)}>
								<Text>群組名稱：{item.name} </Text>
								<Text>成員人數：{item.member_count}</Text>
							</Pressable>
						</View>
					)}
				/> */}
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
    },
})