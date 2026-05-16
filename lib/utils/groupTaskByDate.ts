import { Task } from '@/types/supabase';
import { eachDayOfInterval, format, startOfDay } from 'date-fns';

export interface GroupedTask {
	dateLabel: string;
	tasks: Task[];
}

export const groupTasksByDate = (tasks: Task[]): GroupedTask[] => {
	const groups: Record<string, Task[]> = {};

	for (const task of tasks) {
		try {
			const start = startOfDay(new Date(task.start_date));
			const end = startOfDay(new Date(task.due_date));
			const allDays = eachDayOfInterval({ start, end });

			for (const day of allDays) {
				const dateKey = format(day, 'yyyy-MM-dd'); // 這是 UTC 的日期 Key

				if (!groups[dateKey]) groups[dateKey] = [];
				groups[dateKey].push(task); 
			}
		} catch (error) {
			console.error(`分群失敗:`, error);
		}
	}

	return Object.keys(groups).sort().map((dateKey) => ({
		dateLabel: dateKey,
		tasks: groups[dateKey].sort((a, b) => a.start_date.localeCompare(b.start_date)),
	}));
};
