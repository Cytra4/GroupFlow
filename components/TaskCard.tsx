import { Task } from "@/types/supabase";
import { StyleSheet, Text, View } from "react-native";
import TaskDetail from "./TaskDetail";
import TaskEdit from "./mission/TaskEdit";
import TaskFinish from "./mission/TaskFinish";

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
		default:
			return "#008BFF";
	}
}

function GetDateRange(start_date: string, due_date: string) {
	const s = start_date.replaceAll("-", "/");
	const d = due_date.replaceAll("-", "/");
	return `${s} ~ ${d}`;
}

export default function TaskCard({
	taskData,
	mode = "ViewOnly",
}: {
	taskData: Task;
	mode?: "ViewOnly" | "Editable" | "Finished";
}) {

	const priorityColor = getPriorityColor(taskData.priority);
	const dateRange = GetDateRange(taskData.start_date, taskData.due_date);
	const isEditable = mode === "Editable";
	const isFinished = mode === "Finished";

	return (
		<View
			style={[
				styles.container,
				{
					borderColor: priorityColor,
					flexDirection: "column",
					borderRadius: isEditable || isFinished ? 0 : 16
				},
				(isEditable || isFinished) && {borderColor: "#eee"}
			]}
		>
			<View style={styles.row}>
				<View
					style={[
						styles.priorityBar,
						{ backgroundColor: priorityColor },
					]}
				/>

				<View style={styles.content}>
					<Text style={styles.title}>{taskData.title}</Text>
					<Text style={styles.date}>{dateRange}</Text>
				</View>

				{!isEditable && (
					<TaskDetail
						iconColor={priorityColor}
						taskData={taskData}
						time={dateRange}
					/>
				)}
			</View>

			{/* 我發現Icon底下一直會多一個空格，但是我的CSS技術差到找不到解決方法
			所以我先放了個marginBottom: -10來逃避現實 */}
			{isEditable && (
				<>
					<View style={styles.iconTabs}>
						<TaskFinish
							iconColor={priorityColor}
							iconStyle={{marginBottom: -10}}
							taskData={taskData}
						/>
						<TaskDetail
							iconColor={priorityColor}
							iconStyle={{marginBottom: -10}}
							taskData={taskData}
							time={dateRange}
						/>
						<TaskEdit
							iconColor={priorityColor}
							iconStyle={{marginBottom: -10}}
							taskData={taskData}
						/>
					</View>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		borderWidth: 2.5,
		paddingVertical: 20,
		paddingHorizontal: 16,
		marginBottom: 16,

		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 6,
		shadowOffset: { width: 1, height: 4 },
		elevation: 4,
	},

	row: {
		flexDirection: "row",
		alignItems: "center",
	},

	priorityBar: {
		width: 12,
		height: "100%",
		borderRadius: 16,
		marginLeft: 5,
		marginRight: 18,
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

	iconTabs: {
		flexDirection: "row",
		alignItems: 'center',
		justifyContent: "space-between",
		paddingTop: 12,
		paddingHorizontal: 10
	},
});