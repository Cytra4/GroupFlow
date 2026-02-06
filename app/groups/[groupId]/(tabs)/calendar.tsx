import CustomDay from '@/components/calendar/CustomDay';
import { Loading } from '@/components/Loading';
import { useTask } from '@/lib/hooks/useTask';
import { Task } from '@/types/supabase';
import { useGlobalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarList, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['ch'] = {
	monthNames: [
		'一月', '二月', '三月',
		'四月', '五月', '六月',
		'七月', '八月', '九月',
		'十月', '十一月', '十二月'
	],
	dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
	dayNamesShort: ['日', '一', '二', '三', '四', '五', '六']
};

LocaleConfig.defaultLocale = 'ch';

export type TaskRenderInfo = {
	task: Task;
	isStart: boolean;
	isEnd: boolean;
	rowIndex: number;
};

const formatDate = (date: Date) => {
	return date.toISOString().split('T')[0];
};

const addDays = (date: Date, days: number) => {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
};

//確保任務不會在顯示上被覆蓋
function findAvailableRow(
	start: Date,
	end: Date,
	dayRowUsage: Record<string, Set<number>>,
): number {
	let row = 0;

	while (true) {
		let conflict = false;
		let current = new Date(start);

		while (current <= end) {
			const key = formatDate(current);
			if (dayRowUsage[key]?.has(row)) {
				conflict = true;
				break;
			}
			current = addDays(current, 1);
		}

		if (!conflict) return row;
		row++;
	}
}

// 取得每天有哪些任務
export function GetTasksForEachDay(
	tasks: Task[],
): Record<string, TaskRenderInfo[]> {
	const result: Record<string, TaskRenderInfo[]> = {};
	const dayRowUsage: Record<string, Set<number>> = {};

	for (const task of tasks) {
		const start = new Date(task.start_date);
		const end = new Date(task.due_date);

		const rowIndex = findAvailableRow(start, end, dayRowUsage);

		let current = new Date(start);
		while (current <= end) {
			const dateKey = formatDate(current);

			if (!result[dateKey]) result[dateKey] = [];
			if (!dayRowUsage[dateKey]) dayRowUsage[dateKey] = new Set();

			dayRowUsage[dateKey].add(rowIndex);

			result[dateKey].push({
				task,
				rowIndex,
				isStart: formatDate(current) === formatDate(start),
				isEnd: formatDate(current) === formatDate(end),
			});

			current = addDays(current, 1);
		}
	}

	return result;
}

function getWeekKey(dateString: string) {
	const d = new Date(dateString);
	const sunday = new Date(d);
	sunday.setDate(d.getDate() - d.getDay()); // 週日
	return formatDate(sunday);
}

// 計算每周最大任務數量
function getWeekMaxTasks(
	tasksByDate: Record<string, TaskRenderInfo[]>
) {
	const weekMax: Record<string, number> = {};

	for (const date in tasksByDate) {
		const weekKey = getWeekKey(date);

		for (const t of tasksByDate[date]) {
			const neededRows = t.rowIndex + 1;
			weekMax[weekKey] = Math.max(
				weekMax[weekKey] || 0,
				neededRows
			);
		}
	}

	return weekMax;
}

export default function GroupCalendar() {
	const { groupId } = useGlobalSearchParams<{ groupId: string }>();

	//取得任務資料
	const {
		data: groupTasks,
		isLoading,
		error,
	} = useTask(groupId || "");

	if (isLoading) return <Loading />

	const taskEachDay = GetTasksForEachDay(groupTasks ?? []);
	const weekMaxTasks = getWeekMaxTasks(taskEachDay);

	return (
		<View style={styles.container}>
			<CalendarList
				style={styles.calendar}
				pastScrollRange={12}
				futureScrollRange={12}
				monthFormat={'yyyy年 M月'}
				enableSwipeMonths={true}
				theme={{
					textMonthFontSize: 18,
					textDayHeaderFontSize: 20,
				}}

				onDayPress={date => {
					console.log(`selected day ${date.dateString}`);
				}}

				dayComponent={({ date, onPress, state }) => {
					const dateString = date?.dateString ? date?.dateString : ""
					const weekKey = getWeekKey(dateString);
					const rows = weekMaxTasks[weekKey];

					return (
						<CustomDay
							date={date}
							onDayPress={onPress}
							tasks={taskEachDay[dateString] ?? []}
							maxRows={rows ?? 0}
							dayState={state}
						/>
					)
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	calendar: {
		height: "100%",
		width: "100%"
	}
})