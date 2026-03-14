import { useTaskMembers } from "@/lib/hooks/useTaskMembers";
import { Task } from "@/types/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { Button } from "./Button";
import IconRow from "./IconRow";
import { PressableOpacity } from "./PressableOpacity";

function GetPriorityLabel(prior: number) {
	switch (prior) {
		case 1:
			return "高度優先";
		case 2:
			return "中高度優先";
		case 3:
			return "中度優先";
		case 4:
			return "中低度優先";
		default:
			return "低度優先";
	}
}

export default function TaskDetail(
	{ iconColor, iconSize, iconStyle, taskData, time }
		:
		{
			iconColor?: string, iconSize?: number,
			iconStyle?: object, taskData?: Task,
			time?: string
		}
) {

	const [visible, setVisible] = useState<boolean>(false);
	const membersData = useTaskMembers(taskData?.id ?? 0)['data'];

	return (
		<>
			<PressableOpacity
				PressStyle={[styles.iconButton,iconStyle]}
				onPress={() => setVisible(true)}
			>
				<Ionicons name="information-circle-outline" size={iconSize ?? 30} color={iconColor ?? "blue"} />
			</PressableOpacity>

			<Modal
				transparent
				animationType="fade"
				visible={visible}
				onRequestClose={() => setVisible(false)}
				statusBarTranslucent
			>
				<TouchableWithoutFeedback
					onPress={() => setVisible(false)}
				>
					<View style={styles.centeredView}>
						<TouchableWithoutFeedback>
							<View style={[styles.modalView, { borderWidth: 3.5, borderColor: iconColor ?? "blue" }]}>
								<Text style={styles.title}>{taskData?.title}</Text>

								<View style={styles.line} />

								<Text style={styles.sectionTitle}>任務內容</Text>
								<Text style={styles.taskDesc}>{taskData?.description ?? ""}</Text>

								<View style={styles.line} />

								<Text style={styles.sectionTitle}>任務資訊</Text>
								<IconRow
									icon={"calendar-outline"}
									info={time ?? ""}
									iconSize={25}
								/>
								<IconRow
									icon={"flag-outline"}
									iconColor={iconColor}
									info={`${GetPriorityLabel(taskData?.priority ?? 0)}任務`}
									iconSize={25}
								/>

								<View style={styles.line} />

								<Text style={styles.sectionTitle}>任務成員</Text>

								{/* TO BE DONE */}
								{/* 這邊可能之後得改成使用FlatList，然後要加上頭像 */}
								{membersData?.map((member, index) => {
									return (
										<Text key={index} style={styles.memberName}>
											{member.profiles.username}
										</Text>
									)
								})}

								<Button
									buttonStyle={styles.button}
									textStyle={styles.buttonText}
									title="確認"
									onPress={() => setVisible(false)}
								/>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.3)'
	},
	modalView: {
		width: "80%",
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginTop: 10
	},
	line: {
		borderTopWidth: 2,
		borderColor: "black",
		borderStyle: "dashed",
		width: '100%',
		margin: 20
	},
	sectionTitle: {
		fontSize: 18,
		marginBottom: 10
	},
	taskDesc: {
		fontSize: 16
	},
	button: {
		marginHorizontal: 8,
		marginTop: 50,
		paddingHorizontal: 30,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 18
	},
	memberName: {
		fontSize: 16
	},
	iconButton: {
		alignItems: "center",
		justifyContent: "center",
	}
})