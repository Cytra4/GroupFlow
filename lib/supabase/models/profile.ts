import { Profile } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../client";

type UserProfile = Profile & { email: string };

export function useProfile() {
	return useQuery<UserProfile, Error>({
		queryKey: ["profiles"],
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
