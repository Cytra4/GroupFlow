import TaskSection from '@/components/mission/TaskSection';
import { useGlobalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function Mission(){
	const { groupId } = useGlobalSearchParams<{ groupId: string }>(); 
	const [open, setOpen] = useState<{
		"todo" : boolean,
		"ongoing" : boolean,
		"end" : boolean
	}>({
		"todo" : false,
		"ongoing" : false,
		"end" : false
	});

	function toggle(key : "todo" | "ongoing" | "end"){
		setOpen(prev => ({
			...prev,
			[key]: !prev[key],
		}));
	}

	return (
		<View style={styles.container}>
			<TaskSection
				title='未開始'
				count={1}
				isOpen={open["todo"]}
				onToggle={() => toggle("todo")}
			/>
			<TaskSection
				title='進行中'
				count={1}
				isOpen={open["ongoing"]}
				onToggle={() => toggle("ongoing")}
			/>
			<TaskSection
				title='已結束'
				count={1}
				isOpen={open["end"]}
				onToggle={() => toggle("end")}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: "#fff",
	}
})