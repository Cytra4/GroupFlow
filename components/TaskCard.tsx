import { Task } from "@/types/supabase";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

function getPriorityColor(priority: number) {
	switch (priority) {
		case 1:
			return "#F63049";
		case 2:
			return "#FF7444";
		case 3:
			return "#FAB95B";
		case 4:
			return "#08CB00";
		case 5:
			return "#008BFF";
		default:
			return "#8B5CF6";
	}
}

function GetDateRange(start_date: string, due_date: string){
	let s = start_date;
	let d = due_date;
	let result = "";
	s.replaceAll("-","/");
	d.replaceAll("-","/");
	result = s + " ~ " + d;
	return result;
}

export default function TaskCard({ taskData }: { taskData: Task }) {
	return (
		<View style={[styles.container, {borderColor: getPriorityColor(taskData.priority)}]}>
			<View
				style={[
					styles.priorityBar,
					{ backgroundColor: getPriorityColor(taskData.priority) },
				]}
			/>

			<View style={styles.content}>
				<Text style={styles.title}>{taskData.title}</Text>
				<Text style={styles.date}>
					{GetDateRange(taskData.start_date, taskData.due_date)}
				</Text>
			</View>

			<View style={styles.action}>
				<Ionicons name="information-circle-outline" size={30} color={getPriorityColor(taskData.priority)} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderColor: "#eee",
		borderWidth: 1.5,
		borderRadius: 16,
		paddingVertical: 20,
		paddingRight: 16,
		marginBottom: 16,

		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 6,
		shadowOffset: { width: 1, height: 4 },
		elevation: 4
	},

	priorityBar: {
		width: 12,
		height: "100%",
		borderRadius: 16,
		marginLeft: 18,
		marginRight: 18
	},

	content: {
		flex: 1,
		gap: 6,
	},

	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111",
	},

	date: {
		fontSize: 15,
		color: "#666",
	},

	action: {
		paddingLeft: 8,
		justifyContent: "center",
		alignItems: "center",
	},
});
