import CustomDay from '@/components/calendar/CustomDay';
import GroupHeader from '@/components/GroupHeader';
import { Loading } from '@/components/Loading';
import { useTask } from '@/lib/hooks/useTask';
import { Task } from '@/types/supabase';
import { Tabs, useGlobalSearchParams, useRouter } from 'expo-router';
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
	rowIndex?: number;
};

const formatDate = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
};

// 取得每天有哪些任務
export function GetTasksForEachDay(
	tasks: Task[],
): Record<string, TaskRenderInfo[]> {
	const result: Record<string, TaskRenderInfo[]> = {};

	for (const task of tasks) {
		const start = new Date(task.start_date);
		const end = new Date(task.due_date);

		let current = new Date(start);
		while (current <= end) {
			const dateKey = formatDate(current);

			if (!result[dateKey]) result[dateKey] = [];

			result[dateKey].push({
				task,
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

export default function GroupCalendar() {
	const { groupId } = useGlobalSearchParams<{ groupId: string }>();
	const router = useRouter();

	//取得任務資料
	let {
		data: groupTasks,
		isLoading,
		error,
	} = useTask(groupId || "");
	groupTasks = groupTasks?.filter(t => t.status == "unfinished")

	if (isLoading) return (
		<View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
			<Loading size={'large'} />
		</View>
	)

	const taskEachDay = GetTasksForEachDay(groupTasks ?? []);

	return (
		<>
			<Tabs.Screen
				options={{
					headerRight: () => <GroupHeader />,
				}}
			/>
			<View style={styles.container}>
				<CalendarList
					style={styles.calendar}
					pastScrollRange={12}
					futureScrollRange={12}
					monthFormat={'yyyy年 M月'}
					theme={{
						textMonthFontSize: 18,
						textDayHeaderFontSize: 20,
					}}

					dayComponent={({ date, onPress, state }) => {
						const dateString = date?.dateString ?? "";
						const weekKey = getWeekKey(dateString);

						const todayTasks = taskEachDay[dateString] ?? [];

						const weekTasks = Object.entries(taskEachDay)
							.filter(([d]) => getWeekKey(d) === weekKey)
							.flatMap(([, tasks]) => tasks)
							.map(t => t.task)
							.filter(
								(task, idx, arr) =>
									arr.findIndex(t => t.id === task.id) === idx
							);

						const rowMap = new Map<number, number>();
						let nextRow = 0;

						weekTasks.forEach(task => {
							rowMap.set(task.id, nextRow++);
						});

						const tasksWithRow = todayTasks.map(t => ({
							...t,
							rowIndex: rowMap.get(t.task.id)!,
						}));

						return (
							<CustomDay
								date={date}
								onDayPress={() => {
									router.push({
										pathname: '/groups/[groupId]/dayDetail/[date]',
										params: { groupId, date: dateString }
									})
								}}
								tasks={tasksWithRow}
								maxRows={weekTasks.length}
								dayState={state}
							/>
						);
					}}
				/>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	calendar: {
		width: "100%"
	}
})