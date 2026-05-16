import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatISO } from 'date-fns';
import { useUserQuery } from '../auth/user';

const fetchActiveTasksCount = async (userId: string) => {
	const nowISO = formatISO(new Date()); // 在執行的當下才精準抓取最新 UTC/ISO 時間

	const { count, error } = await supabase
		.from('task')
		.select('*, task_members!inner(user_id)', { count: 'exact', head: true }) // head: true 確保不回傳任何 row 資料，只撈數量
		.eq('task_members.user_id', userId)
		.lte('start_date', nowISO) // start_date <= now
		.gte('due_date', nowISO);  // due_date >= now

	if (error) throw error;
	return count || 0;
};

export const useActiveTasksCount = () => {
	const { data: user } = useUserQuery();

	return useQuery({
		queryKey: ['activeTasksCount', { userId: user?.id }],
		queryFn: () => fetchActiveTasksCount(user!.id),
		enabled: !!user?.id,
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: true,
	});
};
