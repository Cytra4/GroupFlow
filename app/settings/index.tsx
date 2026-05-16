import { DialogRef } from "@/components/UI/BaseDialog";
import { ConfirmDialog } from "@/components/UI/ConfirmDialog";
import { useLogoutMutation } from "@/lib/hooks/auth/user";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SettingsIndex() {
	const router = useRouter();
	const logoutDialogRef = React.useRef<DialogRef>(null)

	const sections = [
		{ id: "profile", title: "個人資料", route: "profile", name: "user" },
		{ id: "password", title: "密碼修改", route: "password", name: "lock" },
		// { id: "notifications", title: "通知設定", route: "notifications" },
		// { id: "privacy", title: "隱私與安全", route: "privacy" },
		// { id: "about", title: "關於我們", route: "about" },
	] as const;

	return (
		<View style={styles.container}>
			{sections.map((section) => (
				<SettingsSection
					key={section.id}
					onPress={() => router.push(`/settings/${section.route}` as Href)}
				>
					<View style={{ flexDirection: 'row', gap: 10 }}>
						<Feather name={section.name} size={20} />
						<Text>{section.title}</Text>
					</View>
				</SettingsSection>
			))}

			<SettingsSection withIcon={false} onPress={() => logoutDialogRef.current?.open()}>
				<Text style={{ color: "coral", fontWeight: 'bold' }}>登出</Text>
			</SettingsSection>

			<ConfirmDialog
				ref={logoutDialogRef}
				confirmText="確認"
				onConfirm={useLogoutMutation().mutate}
			>
				<Text style={{ fontSize: 16, textAlign: "center", color: "#222" }}>
					是否登出？
				</Text>
			</ConfirmDialog>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "column",
		flex: 1,
		backgroundColor: "#efefef",
		alignItems: "center",
	},
	section: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignSelf: "stretch",
		height: 50,
		marginTop: 10,
		marginHorizontal: 10,
		paddingHorizontal: 20,
		backgroundColor: "#fff",
		alignItems: "center",
	}
});

type SettingsSectionProps = {
	children: ReactNode;
	onPress?: () => void;
	withIcon?: boolean;
};

function SettingsSection({ children, onPress, withIcon = true }: SettingsSectionProps) {
	return (
		<Pressable
			onPress={onPress}
			style={styles.section}
		>
			{children}
			{withIcon && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
		</Pressable>
	);
}