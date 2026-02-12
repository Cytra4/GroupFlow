import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
export type TaskMember = { 
	id: string; 
	group_id: string;
	task_id: number;
	user_id: string;  
	profiles: { 
		user_id: string;
		 username: string; 
	}[]; 
}; 

export function useTaskMembers(taskId: number) { 
	return useQuery<TaskMember[], Error>({ 
		queryKey: ["task-members", taskId], 
		enabled: !!taskId, 
		queryFn: async () => {
			 const { data, error } = await supabase 
			 .from("task_members") 
			 .select(` 
				id, 
				group_id,
				task_id, 
				user_id,  
				profiles( 
					user_id, 
					username
				) 
				`) 
				.eq("task_id",taskId) 
				if (error) throw error; 
				return data ?? []; 
			}, 
		}
	); 
}