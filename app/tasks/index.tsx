import { BaseDialog, DialogRef } from '@/components/UI/BaseDialog';
import PressableEffect from '@/components/UI/PressableEffect';
import { Task } from '@/types/supabase';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';


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

const TaskCard = ({ task }: { task: Task }) => {
	const open = React.useContext(TaskDialogContext);
	const config = PRIORITY_MAP[task.priority] || DEFAULT_PRIORITY;

	return (
		<PressableEffect style={cardStyles.container} onPress={() => open(task)}>
			{/* <View style={cardStyles.container}> */}
			<View style={cardStyles.left}>
				<Text style={cardStyles.topText}>13:00</Text>
				<Text style={cardStyles.bottomText}>{getStatus(task)}</Text>
			</View>
			<View style={[cardStyles.bar, { backgroundColor: config.color }]}></View>
			<View style={cardStyles.right}>
				<Text style={cardStyles.topText}>{task.title}</Text>
				<Text style={cardStyles.bottomText}>{task.description}</Text>
			</View>
			{/* </View> */}
		</PressableEffect>
	)
}

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

// 將原本的 const TaskList = ... 改為：
function TaskList({ date, tasks }: { date: string; tasks: Task[] }) {
	return (
		<View style={listStyles.container}>
			<View style={listStyles.header}>
				<Text style={listStyles.headerText}>{date}</Text>
				<View style={listStyles.bar}></View>
			</View>
			{tasks.map((task) => (
				<TaskCard key={`${date}-${task.id}`} task={task} />
			))}
		</View>
	);
}


const listStyles = StyleSheet.create({
	container: {

	},
	headerText: {
		fontSize: 16,
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
})

const TaskDialogContext = React.createContext<(task: Partial<Task> | null) => void>(() => { });
// // TaskDialogContext.tsx
const TaskDialogProvider = ({ children }: { children: React.ReactNode }) => {
	const dialogRef = React.useRef<DialogRef>(null);
	const [activeTask, setActiveTask] = React.useState<Partial<Task> | null>(null);

	const open = (task: Partial<Task> | null) => {
		setActiveTask(task);
		if (task) dialogRef.current?.open();
	};

	return (
		<TaskDialogContext value={open}>
			{children}
			{activeTask && (
				<BaseDialog ref={dialogRef}>
					<View>
						<Text>{activeTask.title}</Text>

						<Text>{activeTask.description || "暫無描述"}</Text>
						<Text>{activeTask.description || "暫無描述"}</Text>
						{/* 這裡可以顯示更多欄位，例如優先級 */}
						<Text>優先級: {activeTask.priority}</Text>
						<Text>狀態: {activeTask.status}</Text>
						<Text>Group: {activeTask.group_id}</Text>
					</View>
				</BaseDialog>
			)}
		</TaskDialogContext>
	);
};

const TaskOverview = () => {
	const groupedData = React.useMemo(() => groupTasksByDate(MOCK_RAW_TASKS), []);

	return (
		<TaskDialogProvider>
			<FlatList
				data={groupedData}
				keyExtractor={(item) => item.dateLabel}
				renderItem={({ item }) => (
					<TaskList
						date={item.dateLabel}
						tasks={item.tasks}
					/>
				)}
				contentContainerStyle={styles.list}
			/>
		</TaskDialogProvider>
	);
};

export default TaskOverview;

const styles = StyleSheet.create({
	list: {
		gap: 16,
		backgroundColor: "#fff",
		paddingHorizontal: 20,
	}
})

// 轉換函式的類型定義
interface GroupedTask {
	dateLabel: string;
	tasks: Task[];
}

/**
 * 將原始 Task 陣列依照 start_date 分組
 */

// utils/taskHelpers.ts
/**
 * 自動轉換為本地日期格式
 */
// const toLocaleDate = (dateString: string) => {
//   try {
//     const date = new Date(dateString);
//     // 使用執行環境的預設語系
//     return new Intl.DateTimeFormat(undefined, {
//       month: 'short',
//       day: 'numeric',
//       weekday: 'short',
//     }).format(date);
//   } catch (e) {
//     return dateString; // 萬一報錯，回傳原始字串
//   }
// };

// TODO: 時間邏輯要加強，start < now 隱藏
const groupTasksByDate = (tasks: Task[]): GroupedTask[] => {
	const groups = tasks
		// .filter(task => task.status === "unfinished")
		.reduce((acc, task) => {
			// 1. 處理開始日期
			const startDate = task.start_date.substring(0, 10);
			if (!acc[startDate]) acc[startDate] = [];
			acc[startDate].push(task);

			// 2. 處理結束日期 (如果不同於開始日期)
			const dueDate = task.due_date.substring(0, 10);
			if (dueDate !== startDate) {
				if (!acc[dueDate]) acc[dueDate] = [];
				acc[dueDate].push(task);
			}

			return acc;
		}, {} as Record<string, Task[]>);

	return Object.keys(groups)
		.sort((a, b) => a.localeCompare(b))
		.map((date) => ({
			dateLabel: date,
			tasks: groups[date].sort((a, b) => 1), // TODO: 之後要根據 start_time 排序
		}));
};




// TODO: 這裡是測試用的假資料，之後要改成從後端撈，要抓 min <= start <= max
const recurringTaskBase: Task = {
	id: 999,
	group_id: "G-01",
	title: "每日進度站會 (重複)",
	description: "同步專案進度，確認阻礙事項。",
	status: "unfinished",
	priority: 1,
	start_date: "",
	due_date: "",
	created_by: "Admin",
	updated_at: "2024-03-08",
};

const MOCK_RAW_TASKS: Task[] = [
	// --- 3月9號 ---
	{ ...recurringTaskBase, start_date: "2024-03-09", due_date: "2024-03-09" },
	{
		id: 1,
		group_id: "G-02",
		title: "專案 A 開發 - Dialog 邏輯",
		description: "實作 BaseDialog 與 Context 資料流接通。",
		status: "unfinished",
		priority: 2,
		start_date: "2024-03-09",
		due_date: "2024-03-09",
		created_by: "User",
		updated_at: "2024-03-09",
	},
	{
		id: 10,
		group_id: "G-05",
		title: "收信與回覆客戶",
		description: "處理上午收到的緊急 Bug 回報。",
		status: "unfinished",
		priority: 1,
		start_date: "2024-03-08",
		due_date: "2024-03-09",
		created_by: "User",
		updated_at: "2024-03-09",
	},

	// --- 3月10號 ---
	{
		id: 2,
		group_id: "G-03",
		title: "環境部署 - 測試機",
		description: "測試伺服器 Docker 映像檔更新與上線。",
		status: "unfinished",
		priority: 3,
		start_date: "2024-03-10",
		due_date: "2024-03-10",
		created_by: "User",
		updated_at: "2024-03-10",
	},
	{
		id: 11,
		group_id: "G-06",
		title: "UI/UX 畫面校正",
		description: "針對深色模式下的文字對比度進行調整。",
		status: "unfinished",
		priority: 5,
		start_date: "2024-03-10",
		due_date: "2024-03-10",
		created_by: "Designer",
		updated_at: "2024-03-10",
	},

	// --- 3月11號 ---
	// { ...recurringTaskBase, start_date: "2024-03-11" },
	{
		id: 12,
		group_id: "G-07",
		title: "週五技術分享會",
		description: "分享 React Native 效能優化心得。",
		status: "unfinished",
		priority: 4,
		start_date: "2024-03-11",
		due_date: "2024-03-11",
		created_by: "Admin",
		updated_at: "2024-03-11",
	},
	{
		id: 13,
		group_id: "G-08",
		title: "撰寫週報",
		description: "整理本週開發進度與下週預計工作。",
		status: "unfinished",
		priority: 5,
		start_date: "2024-03-11",
		due_date: "2024-03-11",
		created_by: "User",
		updated_at: "2024-03-11",
	},

	// --- 3月12號 (模擬更多資料滾動) ---
	{
		id: 14,
		group_id: "G-09",
		title: "資料庫結構重整",
		description: "遷移舊有的 User 欄位至新的 Profile Table。",
		status: "finished",
		priority: 1,
		start_date: "2024-03-12",
		due_date: "2024-03-15",
		created_by: "DBA",
		updated_at: "2024-03-11",
	},
	{
		id: 14,
		group_id: "G-09",
		title: "我不知道",
		description: "這是什麼任務，反正就是測試用的。",
		status: "unfinished",
		priority: 3,
		start_date: "2028-03-12",
		due_date: "2029-03-15",
		created_by: "DBA",
		updated_at: "2024-03-11",
	},
];
