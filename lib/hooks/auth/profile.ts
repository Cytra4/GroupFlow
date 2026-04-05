import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserQuery } from "./user";

export type UserProfile = Profile & { email: string };

export function useProfileQuery() {
	const { data: user } = useUserQuery();

	return useQuery<UserProfile, Error>({
		queryKey: ["profile"],
		enabled: !!user,
		queryFn: async () => {
			const { data: profile, error: error } = await supabase
				.from("profiles")
				.select("*")
				.eq("user_id", user!.id)
				.single();
			if (error) throw error;
			return { ...profile, email: user!.email } as UserProfile;
		},
	});
}

export function useUpdateProfileMutation() {
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
	});
}

