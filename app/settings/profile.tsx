
import { useProfile, useUpdateProfile } from "@/lib/hooks/auth/profile";
import { Profile } from "@/types/supabase";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";


export default function ProfileSettings() {
    const { data: profile } = useProfile();
    const updateProfile = useUpdateProfile();

    const [formDraft, setFormDraft] = React.useState<Partial<Profile>>({});
    const [modified, setModified] = React.useState({ avatar: false, form: false });
    const [errors, setErrors] = React.useState({ username: "", phone: "" });

    const loadingText = useDotAnimation("儲存中");

    async function PickImage() {
        // 先請求權限
        // const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // if (!permissionResult.granted) {
        //     alert("需要相簿權限才能上傳圖片");
        //     return;
        // }

        // 打開相簿
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setFormDraft(draft => ({ ...draft, avatarUrl: uri }));
            setModified({ ...modified, avatar: true });
        }
    }

    async function saveProfile() {
        if (!profile) return;
        if (formDraft.username && !checkName(formDraft.username).valid) return;
        if (formDraft.phone && !checkPhone(formDraft.phone).valid) return;

        updateProfile.mutate({ ...formDraft, user_id: profile.user_id }, {
            onSuccess: () => {
                setModified({ avatar: false, form: false });
            }
        });
    }

    return (<>
        <Stack.Screen
            options={{
                headerRight: () => (modified.avatar || modified.form) ? (
                    <Pressable onPress={saveProfile}>
                        <Text style={styles.saveText}>
                            {updateProfile.isPending ? loadingText : "儲存"}
                        </Text>
                    </Pressable>
                ) : null,
            }}
        />

        <View style={styles.container}>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
                <Pressable>
                    <Image
                        source={
                            formDraft.avatarUrl ? { uri: formDraft.avatarUrl }
                                : profile?.avatarUrl ? { uri: profile.avatarUrl }
                                    : require("@/assets/images/thinking_emoji.png")
                        }
                        style={styles.avatarImage}
                    />
                </Pressable>
                <Pressable
                    onPress={PickImage}
                    style={({ pressed }) => [
                        styles.uploadButton,
                        pressed && { backgroundColor: "#ddd" },
                    ]}
                >
                    <Text style={styles.uploadText}>上傳圖片</Text>
                </Pressable>
            </View>

            { /* Other settings sections */}
            <View style={styles.inputBoxes}>
                <LabelInput
                    label="名稱"
                    value={formDraft.username ?? profile?.username ?? ""}
                    type="text"
                    onChange={(text) => {
                        const { error } = checkName(text);
                        setErrors((prev) => ({ ...prev, username: error ?? "" }));
                        setFormDraft((draft) => ({ ...draft, username: text }));
                        setModified({ ...modified, form: true });
                    }}
                    error={errors.username}
                />
                <LabelInput
                    label="信箱"
                    value={profile?.email ?? ""}
                    type="email"
                />
                <LabelInput
                    label="電話"
                    value={formDraft.phone ?? profile?.phone ?? ""}
                    type="text"
                    onChange={(text) => {
                        const { error } = checkPhone(text);
                        setErrors((prev) => ({ ...prev, phone: error ?? "" }));
                        setFormDraft((draft) => ({ ...draft, phone: text }));
                        setModified({ ...modified, form: true });
                    }}
                    error={errors.phone}
                />
            </View>
        </View>
    </>);
}

const styles = StyleSheet.create({
    saveText: {
        marginRight: 20,
        color: "coral",
        fontSize: 16,
    },
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: "#fefefe",
        paddingHorizontal: 20,
    },
    avatarContainer: {
        alignSelf: "stretch",
        flexDirection: "row",
        marginTop: 30,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    uploadButton: {
        marginLeft: 20,
        alignSelf: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        userSelect: "none",
    },
    uploadText: {
        fontSize: 16,
        color: "#333",
    },
    inputBoxes: {
        marginTop: 30,
        gap: 20,
    },
    inputBox: {
        userSelect: "none",
        position: "relative",
    },
    errorMsg: {
        position: "absolute",
        bottom: -18,
        left: 0,
        color: "#e00",
        fontSize: 12,
    },
    inputLabel: {
        fontSize: 16,
        color: "#333",
    },
    textInput: {
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 5,
    },
    lockedInput: {
        backgroundColor: "#eee",
    }
});

type LabelInputProps = {
    label: string;
    value: string;
    type?: "text" | "email" | "password";
    onChange?: (text: string) => void;
    error?: string;
}

function LabelInput({ label, value, type = "text", onChange, error }: LabelInputProps) {
    return (
        <View style={styles.inputBox}>
            <Text>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                secureTextEntry={type === "password"}
                keyboardType={type === "email" ? "email-address" : "default"}
                style={[styles.textInput, type === "email" && styles.lockedInput]}
                editable={type !== "email"}
            />
            {error && <Text style={styles.errorMsg}>{error}</Text>}
        </View>
    );
}

function useDotAnimation(baseText: string) {
    const [dots, setDots] = React.useState("");
    React.useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);
    return baseText + dots;
}

function checkName(name: string): { valid: boolean; error?: string } {
    if (!name.trim()) {
        return { valid: false, error: "名稱不能為空" };
    }
    if (name.length < 6 || name.length > 10) {
        return { valid: false, error: "名稱長度必須在6到10個字符之間" };
    }
    return { valid: true };
}

function checkPhone(phone: string): { valid: boolean; error?: string } {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return { valid: false, error: "電話號碼必須是10位數字" };
    }
    return { valid: true };
}