import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type UserProfile = Profile & { email: string };

export function useProfile() {
	return useQuery<UserProfile, Error>({
		queryKey: ["profile"],
		queryFn: async () => {
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (userError) throw userError;
			
			const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.eq("user_id", userData.user.id)
			.single();

			if (profileError) throw profileError;
			return { ...profile, email: userData.user.email } as UserProfile;
		},
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (updates: Partial<Profile> & { user_id: string }) => {
			const { error } = await supabase
				.from("profiles")
				.update(updates)
				.eq("user_id", updates.user_id);

			if (error) throw error;
			return updates;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
	});
}

