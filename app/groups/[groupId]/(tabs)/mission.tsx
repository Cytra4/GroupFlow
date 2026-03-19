import TaskSection from '@/components/mission/TaskSection';
import TaskCard from '@/components/TaskCard';
import { useUserTasks } from '@/lib/hooks/useTask';
import { getTaskTimeStatus } from '@/lib/utils/getTaskTimeStatus';
import { useGlobalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function Mission() {
	const { groupId } = useGlobalSearchParams<{ groupId: string }>();
	const [open, setOpen] = useState<{
		"todo": boolean,
		"ongoing": boolean,
		"end": boolean,
		"complete": boolean
	}>({
		"todo": false,
		"ongoing": false,
		"end": false,
		"complete": false
	});

	function toggle(key: "todo" | "ongoing" | "end" | "complete") {
		setOpen(prev => ({
			...prev,
			[key]: !prev[key],
		}));
	}

	const taskData = useUserTasks(groupId)["data"];
	const tasksWithTimeStatus = taskData?.map(task => ({
		...task,
		timeStatus: getTaskTimeStatus(task.start_date, task.due_date)
	}));
	const todoTasks = tasksWithTimeStatus?.filter(
		t => t.status === "unfinished" && t.timeStatus === "未開始"
	);
	const ongoingTasks = tasksWithTimeStatus?.filter(
		t => t.status === "unfinished" && t.timeStatus === "進行中"
	);
	const endTasks = tasksWithTimeStatus?.filter(
		t => t.status === "unfinished" && t.timeStatus === "已結束"
	);
	const completedTasks = tasksWithTimeStatus?.filter(
		t => t.status === "finished"
	);

	return (
		<ScrollView style={styles.scroll}>
			<View style={styles.container}>
				<TaskSection
					title='未開始'
					count={todoTasks?.length ?? 0}
					isOpen={open["todo"]}
					onToggle={() => toggle("todo")}
				>
					{todoTasks?.map((task) => (
						<TaskCard
							key={task.id}
							taskData={task}
							mode="Editable"
						/>
					))}
				</TaskSection>

				<TaskSection
					title='進行中'
					count={ongoingTasks?.length ?? 0}
					isOpen={open["ongoing"]}
					onToggle={() => toggle("ongoing")}
				>
					{ongoingTasks?.map((task) => (
						<TaskCard
							key={task.id}
							taskData={task}
							mode="Editable"
						/>
					))}
				</TaskSection>

				<TaskSection
					title='已結束'
					count={endTasks?.length ?? 0}
					isOpen={open["end"]}
					onToggle={() => toggle("end")}
				>
					{endTasks?.map((task) => (
						<TaskCard
							key={task.id}
							taskData={task}
							mode="Editable"
						/>
					))}
				</TaskSection>

				<TaskSection
					title='已完成'
					count={completedTasks?.length ?? 0}
					isOpen={open["complete"]}
					onToggle={() => toggle("complete")}
				>
					{completedTasks?.map((task) => (
						<TaskCard
							key={task.id}
							taskData={task}
							mode="Finished"
						/>
					))}
				</TaskSection>
			</View>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		backgroundColor: "#f2f5f8",
	},
	scroll: {
		flex: 1,
		backgroundColor: "#f2f5f8"
	}
})