import { PressableOpacity } from "@/components/PressableOpacity";
import Feather from "@expo/vector-icons/Feather";
import { Tabs, useRouter } from "expo-router";
import React from 'react';

export default function _layout() {
	const router = useRouter();

	return (
		<Tabs
			screenOptions={{
				headerTitleAlign: "center",
				headerLeft: () => (
					<PressableOpacity
						onPress={() => router.dismiss()}
					>
						<Feather
							name="arrow-left"
							size={24}
							style={{ marginLeft: 16 }}
						/>
					</PressableOpacity>
				),
				
				tabBarItemStyle: {
					width: "100%",
					height: "100%",
					justifyContent: "center",
					alignItems: "center",
				},
				tabBarActiveTintColor: "coral"
			}}
		>
			<Tabs.Screen
				name="calendar"
				options={{
					title: "時間表",
					tabBarIcon: ({ color, size }) => (
						<Feather name="calendar" color={color} size={size} />
					),
				}}
			/>

			<Tabs.Screen
				name="mission"
				options={{
					title: "我的任務",
					tabBarIcon: ({ color, size }) => (
						<Feather name="check-square" color={color} size={size} />
					),
				}}
			/>

			<Tabs.Screen
				name="forum"
				options={{
					title: "討論區",
					tabBarIcon: ({ color, size }) => (
						<Feather name="message-circle" color={color} size={size} />
					),
				}}
			/>

			<Tabs.Screen
				name="information"
				options={{
					title: "小組資訊",
					tabBarIcon: ({ color, size }) => (
						<Feather name="info" color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	)
}