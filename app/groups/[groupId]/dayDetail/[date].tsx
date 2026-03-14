import TaskCard from "@/components/TaskCard";
import { useTask } from "@/lib/hooks/useTask";
import { hp, wp } from "@/scripts/constants";
import { Task } from "@/types/supabase";
import { useGlobalSearchParams } from "expo-router";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

function GetTaskForToday(groupId: string, date: Date) {
	const taskFetch = useTask(groupId);
	const taskData = taskFetch['data'] ?? []
	let result: Task[] = [];

	taskData.forEach(element => {
		const sDate = new Date(element['start_date']);
		const dDate = new Date(element['due_date']);
		if (date >= sDate && date <= dDate) result.push(element);
	});

	result.sort((a,b) => a.priority - b.priority);

	return result;
}

export default function DayDetail() {
	const { groupId, date } = useGlobalSearchParams();
	const d = new Date(date.toString());
	const dateDisplay = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

	const taskToday = GetTaskForToday(groupId.toString(), d);
	return (
		<View style={styles.container}>
			<Text style={styles.dateText}>{dateDisplay}</Text>
			{taskToday.length ? (
				<FlatList
					showsVerticalScrollIndicator={false}
					data={taskToday}
					style={{ width: wp(80) }}
					keyExtractor={(task) => task.id.toString()}
					renderItem={({ item }) => (
						<TaskCard
							taskData={item}
						/>
					)}
				/>
			) : (
				<View style={styles.content}>
					<Image
						source={require("../../../../assets/images/shocked.png")}
						resizeMode="contain"
						style={styles.shockedPic}
					/>
					<Text style={styles.noTaskText}>今天沒有任何任務!</Text>
				</View>
			)
			}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: "#f8f8f8",
	},
	content: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: hp(15)
	},
	dateText: {
		fontSize: 22,
		fontWeight: "bold",
		margin: 20,
	},
	taskList: {
		justifyContent: 'center'
	},
	shockedPic: {
		height: hp(25),
		width: wp(100),
	},
	noTaskText: {
		fontSize: 25,
		fontWeight: 'bold'
	}
})