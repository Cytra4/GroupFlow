import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUserQuery = () => {
	return useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			const { data, error } = await supabase.auth.getUser();
			if (error) throw error;
			return data.user;
		},
	})
}

export const useLogoutMutation = () => {
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

export const useVerifyPasswordMutation = () => {
	const user = useUserQuery().data;
	return useMutation({
		mutationFn: async (password: string) => {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: user!.email!,
				password,
			});
			if (error) throw error;
			return data;
		},
	});
}

export const useUpdatePasswordMutation = () => {
    return useMutation({
        mutationFn: async (newPassword: string) => {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;
            return data;
        },
    });
};

