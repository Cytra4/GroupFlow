import DateRangePicker from '@/components/datePicker/DateRangePicker';
import { BaseDialog, DialogRef } from '@/components/UI/BaseDialog';
import PressableEffect from '@/components/UI/PressableEffect';
import { useMyTasks } from '@/lib/hooks/tasks/useMyTasks';
import { groupTasksByDate } from '@/lib/utils/groupTaskByDate';
import { Task } from '@/types/supabase';
import { endOfMonth, format, formatISO, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
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
		dialogRef.current?.open();

		console.log(task);
	};
	const config = PRIORITY_MAP[activeTask?.priority ?? 0] || DEFAULT_PRIORITY;
	const status = activeTask ? getStatus(activeTask) : '';


	return (
		<TaskDialogContext value={open}>
			{children}
			<BaseDialog ref={dialogRef}>
				{activeTask && (
					<View style={{ gap: 10 }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							{/* 左側區塊：標題與標籤 */}
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
								<Text style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 20 }}>{activeTask.title}</Text>
								<Text style={{ backgroundColor: config.bgColor, color: config.color, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, overflow: 'hidden', lineHeight: 20 }}>
									{config.label}
								</Text>
							</View>

							{/* 右側區塊：狀態小圓點與文字 */}
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
								<View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: status == "進行中" ? 'green' : 'gray' }} />
								<Text style={{ fontSize: 14, includeFontPadding: false, textAlignVertical: 'center' }}>
									{status}
								</Text>
							</View>
						</View>

						<Text style={{ color: '#666' }}>{activeTask.description}</Text>

						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>

							<View style={{ alignItems: 'flex-start' }}>
								<Text style={{ color: '#999' }}>
									{format(formatISO(activeTask.start_date), 'yyyy/MM/dd ')}
									~
									{format(formatISO(activeTask.due_date), ' yyyy/MM/dd')}
								</Text>
							</View>
							<Pressable
								onPress={() => {
									router.push({
										pathname: `/groups/[groupId]/(tabs)/mission`,
										params: { groupId: activeTask.group_id }
									});
									dialogRef.current?.close();
								}}
								style={{
									backgroundColor: 'coral',
									paddingHorizontal: 10,
									paddingVertical: 6,
									borderRadius: 6,
								}}
							>
								<Text style={{ color: '#fff', fontWeight: 'bold' }}>前往群組</Text>
							</Pressable>
						</View>

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

	const listRef = React.useRef<FlatList>(null);
	const isInitialScrollDone = React.useRef(false);

	React.useEffect(() => {
		if (tasksQuery.isPending || groupedData.length === 0 || isInitialScrollDone.current) return;

		const now = new Date();
		// 確保今天確實在目前的 range 內才執行滾動
		if (isWithinInterval(now, { start: range.start, end: range.end })) {
			const todayString = format(now, 'yyyy-MM-dd');
			const todayIndex = groupedData.findIndex(item => item.dateLabel === todayString);

			if (todayIndex !== -1) {
				setTimeout(() => {
					listRef.current?.scrollToIndex({
						index: todayIndex,
						animated: true,
						viewPosition: 0 // 完美置頂
					});
					isInitialScrollDone.current = true; // 鎖定旗標，此後 range 改變不再干擾
				}, 100);
			}
		}
	}, [groupedData, range, tasksQuery.isPending]);


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
							ref={listRef}
							data={groupedData}
							keyExtractor={(item) => item.dateLabel}
							contentContainerStyle={styles.list}

							onScrollToIndexFailed={(info) => {
								// 讓 FlatList 先自動滾動到大概的位置，使其強制加載該區塊的 UI
								listRef.current?.scrollToOffset({
									offset: info.averageItemLength * info.index,
									animated: false,
								});
								// 加載完成後，立馬精準校正置頂
								setTimeout(() => {
									listRef.current?.scrollToIndex({
										index: info.index,
										animated: true,
										viewPosition: 0,
									});
								}, 60);
							}}

							ListEmptyComponent={
								<View style={styles.emptyContainer}>
									<Text style={styles.emptyText}>該時段尚無任務</Text>
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

									{item.tasks.map((task: Task) => (
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