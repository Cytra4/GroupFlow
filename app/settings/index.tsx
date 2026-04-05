import { useLogoutMutation } from "@/lib/hooks/auth/user";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SettingsIndex() {
    const router = useRouter();

    const sections = [
        { id: "profile", title: "個人資料", route: "profile" },
        { id: "account", title: "帳號設定", route: "account" },
        // { id: "notifications", title: "通知設定", route: "notifications" },
        // { id: "privacy", title: "隱私與安全", route: "privacy" },
        // { id: "about", title: "關於我們", route: "about" },
    ];

    return (
        <View style={styles.container}>
            {sections.map((section) => (
                <SettingsSection
                    key={section.id}
                    onPress={() => router.push(`/settings/${section.id}` as Href)}
                >
                    <Text>{section.title}</Text>
                </SettingsSection>
            ))}

            <SettingsSection withIcon={false} onPress={useLogoutMutation().mutate}>
                <Text style={{ color: "coral" }}>登出</Text>
            </SettingsSection>
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