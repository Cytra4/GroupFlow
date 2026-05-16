import { CreateGroup } from '@/components/CreateGroup';
import { GroupCard } from '@/components/GroupCard';
import JoinGroup from '@/components/JoinGroup';
import { DialogRef } from '@/components/UI/BaseDialog';
import PressableEffect from '@/components/UI/PressableEffect';
import { useUserGroups } from '@/lib/hooks/idk/useGroups';
import { useActiveTasksCount } from '@/lib/hooks/tasks/useActiveTasksCount';
import { Group } from '@/types/supabase';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

function GenColorFromName(group_name: string) {
	let hash = 0;
	for (let i = 0; i < group_name.length; i++) {
		hash = group_name.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = Math.abs(hash) % 360;
	return `hsl(${hue}, 70%, 60%)`;
}

export default function Index() {
	const router = useRouter();
	const { data: userGroups } = useUserGroups();
	const { data: activeTaskCount } = useActiveTasksCount();

	const createGroupRef = useRef<DialogRef>(null);

	return (<>
		<Stack.Screen
			options={{
				headerRight: () => <IndexHeader />
			}}
		/>
		<View style={styles.container}>
			{/* 頂部固定區域：不隨之滾動 */}
			<View style={styles.topActionRow}>
				<PressableEffect
					onPress={() => router.push('/tasks')}
					style={[styles.btn]}
				>
					<Text style={styles.text}>查看任務</Text>
					<View style={styles.badge}>
						<Text style={styles.badgeText}>{activeTaskCount}</Text>
					</View>
				</PressableEffect>

				<PressableEffect style={styles.btn} onPress={() => createGroupRef.current?.open()}>
					<Text style={styles.text}>建立小組</Text>
				</PressableEffect>

				<CreateGroup ref={createGroupRef} />
			</View>

			{/* 列表區域：只在此區域內滾動 */}
			<View style={styles.listContainer}>
				<GroupListScreen userGroups={userGroups} />
			</View>
		</View >
	</>)
}

function IndexHeader() {
	const router = useRouter();
	return (
		<Feather
			name="settings"
			size={24}
			style={{ marginRight: 16 }}
			onPress={() => { router.push('/settings'); }}
		/>
	);
}

function GroupListScreen({ userGroups }: { userGroups: Group[] | undefined }) {
	const [searchQuery, setSearchQuery] = React.useState('');
	const filteredGroups = userGroups?.filter((group) =>
		group.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
	const router = useRouter();

	return (
		<View style={{ flex: 1 }}>
			<View style={groupStyles.headerRow}>
				<Text style={groupStyles.headerTitle}>所有小組</Text>
				<JoinGroup />
			</View>

			<View style={groupStyles.searchContainer}>
				<TextInput
					style={groupStyles.searchInput}
					placeholder="搜尋小組名稱..."
					placeholderTextColor="#999"
					value={searchQuery}
					onChangeText={setSearchQuery}
					clearButtonMode="while-editing"
				/>
			</View>

			<FlatList
				showsVerticalScrollIndicator={false}
				data={filteredGroups}
				contentContainerStyle={groupStyles.listContent}
				keyExtractor={(group) => group.id}
				renderItem={({ item }) => (
					<GroupCard
						group_name={item.name}
						member_counts={item.member_count}
						created_at={new Date(item.created_at)}
						headerColor={GenColorFromName(item.name)}
						onPress={() => {
							router.push({
								pathname: `/groups/[groupId]/calendar`,
								params: { groupId: item.id },
							});
						}}
					/>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1, // 💡 讓最外層撐滿螢幕
		flexDirection: "column",
		backgroundColor: "#f2f5f8",
	},
	topActionRow: {
		flexDirection: 'row',
		gap: 20,
		paddingHorizontal: 30, // 💡 移至此處統一對齊
		marginTop: 20,
		marginBottom: 10,
	},
	listContainer: {
		flex: 1, // 💡 重要：分配賸餘的所有高度給列表容器
		paddingHorizontal: 30,
	},
	btn: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 12,
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		boxShadow: '1px 2px 5px rgba(0, 0, 0, 0.08)',
		elevation: 2,
	},
	text: {
		fontSize: 14,
		fontWeight: "bold",
		color: '#000',
	},
	badge: {
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: 'coral',
		alignItems: 'center',
		justifyContent: 'center',
	},
	badgeText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 12,
	}
});

const groupStyles = StyleSheet.create({
	listContent: {
		paddingVertical: 10,
		gap: 20,
	},
	headerRow: {
		justifyContent: 'space-between',
		flexDirection: 'row',
		marginVertical: 10,
		alignItems: 'center',
	},
	headerTitle: {
		fontWeight: 'bold',
		fontSize: 20,
	},
	searchContainer: {
		width: '100%',
		paddingVertical: 5,
	},
	searchInput: {
		height: 45,
		backgroundColor: '#fff',
		paddingHorizontal: 15,
		borderRadius: 10,
		fontSize: 16,
		borderColor: '#eee',
		borderWidth: 1,
		boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.05)',
		elevation: 2,
	},
});
