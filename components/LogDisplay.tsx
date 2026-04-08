import { Group_Logs } from "@/types/supabase";
import { StyleSheet, Text, View } from "react-native";

export default function LogDisplay(
	{ logData, isGroupRelated}: { logData: Group_Logs, isGroupRelated: boolean }
) {

	function getActionText(action_type: string) {
		if (action_type == "create") {
			return "新增了";
		}
		else if (action_type == "update") {
			return "更新了";
		}
		else if (action_type == "delete") {
			return "刪除了";
		}
		else if (action_type == "finish") {
			return "完成了";
		}
		else if (action_type == "leave") {
			return "離開了";
		}
		else if (action_type == "join") {
			return "加入了";
		}
		else {
			return "進行了操作";
		}
	}

	function getTargetText(target_type: string) {
		if (target_type == "task") {
			return "任務";
		}
		else if (target_type == "discussion"){
			return "討論串";
		}
		else if (target_type == "group"){
			return "小組";
		}
		return "";
	}

	function getMessage(logData: Group_Logs) {
		var result = "";
		result += logData.username + " ";
		result += getActionText(logData.action_type);
		result += getTargetText(logData.target_type);
		if (!isGroupRelated){
			result += "「" + logData.content + "」";
		}
		return result;
	}

	function formatTime(logData: Group_Logs) {
		const date = new Date(logData.created_at);

		const year = date.getFullYear();

		const month = String(
			date.getMonth() + 1
		).padStart(2, "0");

		const day = String(
			date.getDate()
		).padStart(2, "0");

		const hours = String(
			date.getHours()
		).padStart(2, "0");

		const minutes = String(
			date.getMinutes()
		).padStart(2, "0");

		return `${year}/${month}/${day} ${hours}:${minutes}`;
	}

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<Text style={styles.dot}>●</Text>
				<Text style={styles.text}>
					{getMessage(logData)}
				</Text>
			</View>
			<View style={styles.row}>
				<Text style={[styles.dot, { color: "white" }]}>●</Text>
				<Text style={styles.timeText}>
					{formatTime(logData)}
				</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 12,
		marginBottom: 8
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	text: {
		fontSize: 15
	},
	timeText: {
		color: "gray"
	},
	dot: {
		fontSize: 15,
		marginRight: 8
	}
})