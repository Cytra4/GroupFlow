import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatISO } from 'date-fns';
import { useUserQuery } from '../auth/user';

const fetchTasksByMember = async (userId: string, startDateISO: string, endDateISO: string) => {
	const { data, error } = await supabase
		.from('task')
		.select('*, task_members!inner(user_id)')
		.eq('task_members.user_id', userId)
		.lte('start_date', endDateISO)
		.gte('due_date', startDateISO)
		.order('due_date', { ascending: true });

	if (error) throw error;
	return data;
};

export const useMyTasks = (startDate: Date, endDate: Date) => {
	const { data: user } = useUserQuery();
	const startISO = formatISO(startDate), endISO = formatISO(endDate);

	return useQuery({
		queryKey: ['myTasks', { userId: user?.id, startDate: startISO, endDate: endISO }],
		queryFn: () => fetchTasksByMember(user!.id, startISO, endISO),
		enabled: !!user?.id,
	});
};
