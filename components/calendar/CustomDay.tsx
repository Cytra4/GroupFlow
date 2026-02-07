import { TaskRenderInfo } from "@/app/groups/[groupId]/(tabs)/calendar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DateData } from "react-native-calendars";
import { DayState } from "react-native-calendars/src/types";

//最大顯示任務數量
const MAX_VISIBLE = 3;

function chooseBarStyle(task: TaskRenderInfo) {
	const colors = [
		'#F63049', '#FF7444', '#FAB95B',
		'#08CB00', '#008BFF', '#8B5CF6'
	];

	return {
		backgroundColor: colors[task.task.priority - 1] ?? colors[5],
		borderTopLeftRadius: task.isStart ? 6 : 0,
		borderBottomLeftRadius: task.isStart ? 6 : 0,
		borderTopRightRadius: task.isEnd ? 6 : 0,
		borderBottomRightRadius: task.isEnd ? 6 : 0,
	};
}

function shouldShowText(
	task: TaskRenderInfo,
	isSunday: boolean
) {
	return task.isStart || isSunday;
}

export default function CustomDay(
	{ date, onDayPress, tasks, maxRows, dayState }
		:
		{
			date: (string & DateData) | undefined,
			onDayPress: any,
			tasks: TaskRenderInfo[],
			maxRows: number,
			dayState: DayState | undefined
		}

) {
	//取顯示任務
	const filledTasks = Array.from({ length: maxRows }, (_, row) =>
		tasks.find(t => t.rowIndex === row) ?? null
	);

	const visibleTasks = filledTasks.slice(0, MAX_VISIBLE);
	const maxUsedRow =
		tasks.length > 0
			? Math.max(...tasks.map(t => t.rowIndex)) + 1
			: 0;

	const plusN = Math.max(0, maxUsedRow - MAX_VISIBLE);

	return (
		<View style={styles.container}>
			{/* 日期 */}
			<TouchableOpacity onPress={onDayPress}>
				<Text style={[styles.dayText,
				dayState == 'today' ?
					{ color: '#F63049', fontWeight: 'bold' }
					: { color: 'black' }]}
				>
					{date?.day}
				</Text>
			</TouchableOpacity>

			{/* 顯示任務 */}
			{visibleTasks.map((t, i) => {
				// 沒有任務的話回傳空格
				if (!t) {
					return <View key={i} style={styles.taskRow} />;
				}

				// 日期取得有問題的話結束
				if (!date?.dateString) {
					return;
				}

				const dateObj = new Date(date?.dateString);
				const isSunday = dateObj.getDay() === 0;
				const showText = shouldShowText(t, isSunday);

				return (
					<View key={i} style={styles.taskRow}>
						<View style={[styles.taskBar, chooseBarStyle(t)]}>
							{showText && (
								<Text style={styles.taskText} numberOfLines={1}>
									{t.task.title}
								</Text>
							)}
						</View>
					</View>
				);
			})}

			{/* 顯示+N */}
			{plusN > 0 && (
				<View style={styles.plusText}>
					<Text>+{plusN}</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "stretch",
		width: '100%'
	},
	dayText: {
		fontSize: 18,
		marginBottom: 8,
		alignSelf: "center"
	},
	taskRow: {
		height: 20,
		width: '100%',
		marginBottom: 2,
	},
	taskBar: {
		flex: 1,
		height: 18,
		width: '100%',
		paddingHorizontal: 4,
		justifyContent: 'center',
		borderRadius: 5,
		overflow: 'hidden'
	},
	taskText: {
		fontSize: 13,
		color: 'white',
		fontWeight: '600',
		alignSelf: "center"
	},
	plusText: {
		fontSize: 13,
		alignSelf: "center"
	},
})