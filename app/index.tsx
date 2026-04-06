import CreateGroup from '@/components/CreateGroup';
import { GroupCard } from '@/components/GroupCard';
import JoinGroup from '@/components/JoinGroup';
import { useUserGroups } from '@/lib/hooks/idk/useGroups';
import { wp } from '@/scripts/constants';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

export default function Index() {
    const router = useRouter();

    const { data: userGroups } = useUserGroups();

    //根據小組名稱生成header顏色
    function GenColorFromName(group_name: string) {
        let hash = 0;
        for (let i = 0; i < group_name.length; i++) {
            hash = group_name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    return (<>
        <Stack.Screen
            options={{
                headerRight: () => <IndexHeader />
            }}
        />
        <View style={styles.container}>
            <CreateGroup />

            <FlatList
                showsVerticalScrollIndicator={false}
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
                                pathname: `/groups/[groupId]/calendar`,
                                params: { groupId: item.id },
                            });
                        }
                        }
                    />
                )}
            />
        </View >
    </>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2f5f8",
    },
})

function IndexHeader() {
    const router = useRouter();

    return (
        <>
            <JoinGroup />
            <Feather
                name="settings"
                size={24}
                style={{ marginRight: 16 }}
                onPress={() => { router.push('/settings'); }}
            />
        </>
    );
}
