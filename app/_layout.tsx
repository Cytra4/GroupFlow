import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../scripts/AuthContext";

export default function Layout() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RootLayout />
			</AuthProvider>
		</QueryClientProvider>
	);
}

function RootLayout() {
	const { user, setAuth } = useAuth();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [isAuthChecking, setIsAuthChecking] = useState(true);

	console.log("=== RootLayout 重新渲染 ===");
	console.log("目前 user 狀態:", user ? "有值" : "null/undefined");
	console.log("目前驗證狀態 isAuthChecking:", isAuthChecking);

	useEffect(() => {
		const { data: sub } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setAuth(session?.user ?? null);
				setIsAuthChecking(false);
			}
		);

		return () => sub.subscription.unsubscribe();
	}, []);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || isAuthChecking) return;

		if (!user) {
			router.replace('/login');
		} 
		
	}, [user, mounted, isAuthChecking]); 

	if (!mounted || isAuthChecking) {
		return null; 
	}

	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: true, headerTitle: "Group Flow", headerTitleAlign: "center", headerBackVisible: false}} />
			<Stack.Screen name="groups/[groupId]" options={{ headerShown: false }} />
			<Stack.Screen name="login" options={{ headerShown: false }} />
			<Stack.Screen name="signUp" options={{ headerShown: false }} />
			<Stack.Screen name="settings" options={{ headerShown: false }} />
			<Stack.Screen name="tasks/index" options={{ headerShown: true, headerTitle: "任務總覽", headerTitleAlign: "center" }} />
		</Stack>
	);
}
