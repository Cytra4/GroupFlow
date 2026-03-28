import { useGroup } from '@/lib/hooks/idk/useGroups';
import { useGroupMembers } from '@/lib/hooks/useGroupMembers';
import { useGlobalSearchParams } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

export default function Information() {
	const { groupId } = useGlobalSearchParams<{ groupId: string }>();
	const { data: groupData } = useGroup(groupId);
	const { data: groupMembers } = useGroupMembers(groupId);
	const creator = groupMembers?.find(
		m => m.user_id === groupData?.created_by
	)

	return (
		<View style={styles.container}>
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
					<View style={[styles.sectionContent, {alignItems: 'center'}]}>
						<Text style={[styles.label, {alignSelf: 'flex-start'}]}>小組成員</Text>
						<FlatList
							data={groupMembers}
							key={"_"}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => {
								return (
									<View style={styles.memberRow}>
										<Image
											source={{ uri: item.profiles.avatarUrl || "https://picsum.photos/200" }}
											style={styles.profilePic}
										/>

										<Text style={styles.memberName}>
											{item.profiles.username}
										</Text>
									</View>
								)
							}}
							showsVerticalScrollIndicator={false}
							numColumns={3}
						/>
					</View>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f2f5f8",
		alignItems: 'center',
		padding: 8
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
		width: 25,
		height: 25,
		borderRadius: 65,
		marginRight: 8
	},
	memberRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		marginHorizontal: 8
	}
})