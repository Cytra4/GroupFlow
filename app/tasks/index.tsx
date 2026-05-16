import DateRangePicker from '@/components/datePicker/DateRangePicker';
import { BaseDialog, DialogRef } from '@/components/UI/BaseDialog';
import PressableEffect from '@/components/UI/PressableEffect';
import { useMyTasks } from '@/lib/hooks/tasks/useMyTasks';
import { groupTasksByDate } from '@/lib/utils/groupTaskByDate';
import { Task } from '@/types/supabase';
import { endOfMonth, format, formatISO, parseISO, startOfMonth } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

// constants/priority.ts
const PRIORITY_MAP: Record<number, { label: string, color: string, bgColor: string }> = {
	1: { label: '高度優先', color: '#E53935', bgColor: '#FFEBEE' },
	2: { label: '中高度優先', color: '#FB8C00', bgColor: '#FFF3E0' },
	3: { label: '中度優先', color: '#1E88E5', bgColor: '#E3F2FD' },
	4: { label: '中低度優先', color: '#43A047', bgColor: '#E8F5E9' },
	5: { label: '低度優先', color: '#757575', bgColor: '#F5F5F5' },
};

// // 預設值，萬一後端給了 1~5 以外的數字
const DEFAULT_PRIORITY = { label: '未知', color: '#9E9E9E', bgColor: '#F5F5F5' };

function getStatus(task: Task): "完成" | "逾期" | "進行中" | "尚未開始" {
	const now = new Date();
	const start = new Date(task.start_date);
	const due = new Date(task.due_date);

	if (task.status === "finished") {
		return "完成";
	} else if (now > due) {
		return "逾期";
	} else if (now >= start) {
		return "進行中";
	} else {
		return "尚未開始";
	}
}

const TaskCard = ({ task, date }: { task: Task; date: string }) => {
	const open = React.useContext(TaskDialogContext);
	const config = PRIORITY_MAP[task.priority ?? 5] || DEFAULT_PRIORITY;

	const { topText, bottomText } = React.useMemo(() => {
		const start = parseISO(task.start_date);
		const end = parseISO(task.due_date);

		const isStartDay = date === format(start, 'yyyy-MM-dd');
		const isDueDay = date === format(end, 'yyyy-MM-dd');

		if (isStartDay && isDueDay)
			return { topText: format(start, 'HH:mm'), bottomText: `~ ${format(end, 'HH:mm')}` };
		if (isStartDay)
			return { topText: format(start, 'HH:mm'), bottomText: '開始' };
		if (isDueDay)
			return { topText: format(end, 'HH:mm'), bottomText: '截止' };

		return { topText: '全天', bottomText: `~ ${format(end, 'MM/dd')}` };
	}, [task.start_date, task.due_date, date, task.status]);

	return (
		<PressableEffect style={cardStyles.container} onPress={() => open(task)}>
			<View style={cardStyles.left}>
				<Text style={cardStyles.topText}>{topText}</Text>
				<Text style={cardStyles.bottomText}>{bottomText}</Text>
			</View>
			<View style={[cardStyles.bar, { backgroundColor: config.color }]}></View>
			<View style={cardStyles.right}>
				<Text style={cardStyles.topText}>{task.title}</Text>
				<Text style={cardStyles.bottomText}>{task.description || "暫無描述"}</Text>
			</View>
		</PressableEffect>
	);
};

const cardStyles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		paddingVertical: 8,
		paddingHorizontal: 10,
		borderRadius: 8,
	},
	left: {
		width: 60,
	},
	bar: {
		width: 6,
		borderRadius: 3,
		marginHorizontal: 10,
	},
	right: {
		flex: 1,
	},
	topText: {
		fontSize: 16,
		fontWeight: 'bold',
		lineHeight: 20,
	},
	bottomText: {
		fontSize: 14,
		color: '#333',
		lineHeight: 18,
	}
})

// // TaskDialogContext.tsx
const TaskDialogContext = React.createContext<(task: Task | null) => void>(() => { });

const TaskDialogProvider = ({ children }: { children: React.ReactNode }) => {
	const dialogRef = React.useRef<DialogRef>(null);
	const [activeTask, setActiveTask] = React.useState<Task | null>(null);
	const router = useRouter();

	const open = (task: Task | null) => {
		setActiveTask(task);
		if (task) dialogRef.current?.open();
	};

	return (
		<TaskDialogContext value={open}>
			{children}
			<BaseDialog ref={dialogRef}>
				{activeTask && (
					<View>
						<Text>{activeTask.title}</Text>
						<Text>{activeTask.description || "暫無描述"}</Text>

						<Text>
							{format(formatISO(activeTask.start_date), 'yyyy/MM/dd')}
							~
							{format(formatISO(activeTask.due_date), 'yyyy/MM/dd')}
						</Text>

						<Text>優先級: {activeTask.priority}</Text>
						<Text>狀態: {activeTask.status}</Text>
						<Pressable
							onPress={() => {
								router.push(`/groups/${activeTask.group_id}/mission`);
								dialogRef.current?.close();
							}}
						>
							<Text>前往群組</Text>
						</Pressable>
					</View>
				)}
			</BaseDialog>
		</TaskDialogContext>
	);
};

const TaskOverview = () => {
	const [range, setRange] = React.useState({
		start: startOfMonth(new Date()),
		end: endOfMonth(new Date()),
	});
	const tasksQuery = useMyTasks(range.start, range.end);

	const groupedData = React.useMemo(() => {
		const allGroups = groupTasksByDate(tasksQuery.data || []);

		const startString = format(range.start, 'yyyy-MM-dd');
		const endString = format(range.end, 'yyyy-MM-dd');

		return allGroups.filter(
			(group) => group.dateLabel >= startString && group.dateLabel <= endString
		);
	}, [tasksQuery.data, range]);

	return (
		<View style={styles.container}>
			<View style={{ paddingHorizontal: 16 }}>
				<DateRangePicker range={range} onChange={setRange} />
			</View>

			<View style={styles.listContainer}>
				<Text style={styles.taskCountText}>目前共 {tasksQuery.data?.length || 0} 個任務</Text>

				<TaskDialogProvider>
					{tasksQuery.isPending ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color="#007AFF" />
						</View>
					) : (
						<FlatList
							data={groupedData}
							keyExtractor={(item) => item.dateLabel}
							contentContainerStyle={styles.list}

							ListEmptyComponent={
								<View style={styles.emptyContainer}>
									<Text style={styles.emptyText}>當前選取區間內無任務</Text>
								</View>
							}
							renderItem={({ item }) => {
								const localDateLabel = format(
									parseISO(`${item.dateLabel}T00:00:00Z`),
									'M月d號, EEEE',
									{ locale: zhTW }
								);

								return (<>
									<View style={styles.header}>
										<Text style={styles.headerText}>{localDateLabel}</Text>
										<View style={styles.bar}></View>
									</View>

									{item.tasks.map(task => (
										<TaskCard
											key={`${item.dateLabel}-${task.id}`}
											task={task}
											date={item.dateLabel}
										/>
									))}
								</>);
							}}
						/>
					)}
				</TaskDialogProvider>
			</View>

		</View>
	);
};

export default TaskOverview;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f2f5f8",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	taskCountText: {
		textAlign: 'center',
		fontWeight: 'bold',
		lineHeight: 60,
	},
	listContainer: {
		backgroundColor: '#fff',
		borderTopLeftRadius: 60,
		borderTopRightRadius: 60,
		flex: 1,
	},
	list: {
		overflow: 'hidden',
		paddingHorizontal: 30,
		paddingBottom: 16,
		gap: 16,
	},
	emptyContainer: {
		paddingVertical: 80,
		alignItems: 'center'
	},
	emptyText: {
		fontSize: 14,
		color: '#999'
	},
	headerText: {
		fontSize: 14,
		color: '#111',
		fontWeight: 'bold',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	bar: {
		flex: 1,
		height: 1,
		backgroundColor: '#ccc',
	}
});

