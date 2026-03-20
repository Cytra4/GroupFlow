
import { useProfile, UserProfile } from "@/lib/hooks/auth/profile";
import { supabase } from "@/lib/supabase/client";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";


export default function ProfileSettings() {
    const { data: profile } = useProfile();

    const [formDraft, setFormDraft] = React.useState<Partial<UserProfile>>({});
    const [modified, setModified] = React.useState({ avatar: false, form: false });

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

        let draft = { ...formDraft };

        if (draft.avatarUrl && draft.avatarUrl.startsWith("file:")) {
            draft.avatarUrl = await uploadAvatar(draft.avatarUrl, profile.user_id);
        }

        const { error } = await supabase
            .from("profiles")
            .update(draft)
            .eq("user_id", profile?.user_id);

        if (error) {
            console.log("Profile settings update error: " + error.message);
            return;
        }

        setModified({ avatar: false, form: false });
    }

    return (<>
        <Stack.Screen
            options={{
                headerRight: () =>
                    (modified.avatar || modified.form) ? (
                        <Pressable onPress={() => { saveProfile() }}>
                            <Text style={styles.saveText}>保存</Text>
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
                        setFormDraft((draft) => ({ ...draft, username: text }));
                        setModified({ ...modified, form: true });
                    }}
                />
                <LabelInput
                    label="信箱"
                    value={formDraft.email ?? profile?.email ?? ""}
                    type="email"
                    onChange={(text) => {
                        setFormDraft((draft) => ({ ...draft, email: text }));
                        setModified({ ...modified, form: true });
                    }}
                />
                <LabelInput
                    label="電話"
                    value={formDraft.phone ?? profile?.phone ?? ""}
                    type="text"
                    onChange={(text) => {
                        setFormDraft((draft) => ({ ...draft, phone: text }));
                        setModified({ ...modified, form: true });
                    }}
                />
            </View>
        </View>
    </>);
}

const styles = StyleSheet.create({
    saveText: {
        marginRight: 20,
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
    onChange: (text: string) => void;
}

function LabelInput({ label, value, type = "text", onChange }: LabelInputProps) {
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
        </View>
    );
}

import CryptoJS from "crypto-js";
import { Platform } from "react-native";

export async function uploadAvatar(uri: string, userId: string): Promise<string> {
    const config = {
        cloud_name: "dq8jvjcv4",
        api_key: "668727717621116",
        api_secret: "xpCfuSucQ3IeK_B2fOf7TJFry2I",
    };

    const publicId = `user_${userId}`;
    const folder = "avatars";
    const timestamp = Math.floor(Date.now() / 1000);

    const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${config.api_secret}`;
    const signature = CryptoJS.SHA1(toSign).toString();

    const data = new FormData();

    if (Platform.OS === "web" && uri.startsWith("blob:")) {
        const res = await fetch(uri);
        const blob = await res.blob();
        data.append("file", blob, `avatar_${userId}.png`);
    } else {
        data.append("file", {
            uri,
            type: "image/jpeg",
            name: `avatar_${userId}.jpg`,
        } as any);
    }

    data.append("public_id", publicId);
    data.append("folder", folder);
    data.append("timestamp", timestamp.toString());
    data.append("api_key", config.api_key);
    data.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`, {
        method: "POST",
        body: data,
    });

    const json = await res.json();
    console.log("Cloudinary response:", json);

    return `${json.secure_url}?t=${Date.now()}`;
}
