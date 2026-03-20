import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: "使用者設定", headerTitleAlign: "center" }}
            />
            <Stack.Screen
                name="profile"
                options={{ title: "個人資料" }}
            />
            <Stack.Screen
                name="account"
                options={{ title: "帳號設定" }}
            />
            {/* <Stack.Screen
        name="notifications"
        options={{ title: "通知設定" }}
      />
      <Stack.Screen
        name="privacy"
        options={{ title: "隱私與安全" }}
      />
      <Stack.Screen
        name="about"
        options={{ title: "關於我們" }}
      /> */}
        </Stack>
    );
}
