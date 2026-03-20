import { supabase } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useLogout = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		},
		onSuccess: () => {
			qc.clear();
		}
	})
}

