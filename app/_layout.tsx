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
    const { user, setAuth, setUserData } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setAuth(session?.user ?? null);
            }
        );

        return () => sub.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (user) {
            router.replace('/');        // 進入 index（tabs 外或內都可）
        } else {
            router.replace('/login');
        }
    }, [user, mounted]);

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    headerTitle: "我的小組",
                    headerTitleAlign: "center",
                    // headerRight: () => <IndexHeader />
                }}
            />

            <Stack.Screen
                name="groups/[groupId]"
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="login"
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="signUp"
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="settings"
                options={{ headerShown: false, }}
            />
        </Stack>
    );
}
