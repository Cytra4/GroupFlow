import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableOpacity } from './PressableOpacity';

export function GroupCard({
	group_name = "AAA",
	member_counts = 0,
	headerColor = "coral",
	created_at = new Date(),
	onPress = () => {}
}) {
	const formattedDate = created_at.toISOString().split("T")[0];

	return (
		<PressableOpacity 
			PressStyle={styles.card}
			onPress={onPress}
		>
			<View style={[styles.header, { backgroundColor: headerColor }]} />

			<View style={styles.content}>
				<Text style={styles.groupName}>小組名稱：{group_name}</Text>
				<View style={{ flexDirection: "row" }}>
					<Feather
						name="users"
						size={20}
						color="#555"
						style={{marginRight:8}}
					/>
					<Text style={styles.info}>小組人數：{member_counts}</Text>
				</View>
				<View style={{ flexDirection: "row" }}>
					<Feather
						name="calendar"
						size={20}
						color="#555"
						style={{marginRight:8}}
					/>
					<Text style={styles.info}>成立時間：{formattedDate}</Text>
				</View>
			</View>
		</PressableOpacity>
	)
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#eee",
		borderRadius: 12,
		// marginVertical: 12,
		width: "100%",

		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 3 },
		elevation: 5,
		overflow: "hidden",
	},
	header: {
		height: 20,
		width: "100%",
	},
	content: {
		padding: 15,
		alignItems: "flex-start"
	},
	groupName: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 6,
	},
	info: {
		fontSize: 16,
		color: "#555",
		marginBottom: 4,
	},
})
