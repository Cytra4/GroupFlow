import TaskSection from '@/components/mission/TaskSection';
import TaskCard from '@/components/TaskCard';
import { useUserTasks } from '@/lib/hooks/useTask';
import { useGlobalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function Mission() {
	const { groupId } = useGlobalSearchParams<{ groupId: string }>();
	const [open, setOpen] = useState<{
		"todo": boolean,
		"ongoing": boolean,
		"end": boolean
	}>({
		"todo": false,
		"ongoing": false,
		"end": false
	});

	function toggle(key: "todo" | "ongoing" | "end") {
		setOpen(prev => ({
			...prev,
			[key]: !prev[key],
		}));
	}

	const taskData = useUserTasks(groupId)["data"];
	const todoTasks = taskData?.filter((task) => task["status"] == "未開始");
	const ongoingTasks = taskData?.filter((task) => task["status"] == "進行中");
	const endTasks = taskData?.filter((task) => task["status"] == "已結束");

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