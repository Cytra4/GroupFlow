import { Button } from '@/components/Button';
import { GroupCard } from '@/components/GroupCard';
import { useSignOut } from '@/lib/supabase/auth';
import { useProfile } from '@/lib/supabase/models/profile';
import { useFetch, useInsert } from '@/lib/supabase/query';
import { useAuth } from '@/scripts/AuthContext';
import { wp } from '@/scripts/constants';
import { Group, Group_Member } from '@/types/supabase';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function Index() {
	const { user, setAuth } = useAuth();

	const signOutMutation = useSignOut();
	const { data: profile } = useProfile();

	const insertMutation = useInsert();
	// const { data: groups } = useFetch<Group>('groups', {
	// 	order: [{ column: 'created_at', ascending: false }]
	// });

	const router = useRouter();

	//取得使用者在的小組的ID
	const { data: group_member } = useFetch<Group_Member>('group_members', {
		order: [{ column: 'joined_at', ascending: false }],
		filter: { 'user_id': profile?.user_id },
	})
	const group_ids = group_member?.map(gm => gm.group_id) ?? [];

	//取得使用者在的小組資料
	const { data: userGroups } = useFetch<Group>('groups', {
		order: [{ column: 'created_at', ascending: false }],
		filter:
			group_ids.length > 0
				? { id: group_ids }
				: { id: ['__never_match__'] },
	});

	//根據小組名稱生成header顏色
	//(在想這東西有沒有存在的必要)
	function GenColorFromName(group_name: string) {
		let hash = 0;
		for (let i = 0; i < group_name.length; i++) {
			hash = group_name.charCodeAt(i) + ((hash << 5) - hash);
		}
		const hue = Math.abs(hash) % 360;
		return `hsl(${hue}, 70%, 60%)`;
	}

	return (
		<View style={styles.container}>
			<Text>名稱：{profile?.username}</Text>
			<Text>權限：{profile?.role === 'user' ? '一般使用者' : profile?.role === 'admin' ? '管理員' : "未知"}</Text>
			<Text
				onPress={() => signOutMutation.mutate()}
				style={{ fontSize: 20 }}
			>
				登出
			</Text>
			<Button
				title='Add Group'
				onPress={() => {
					insertMutation.mutate({
						table: 'groups', row: {
							name: `By ${profile?.username}`,
							created_by: profile?.user_id
						}
					});
				}}
				loading={insertMutation.isPending}
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