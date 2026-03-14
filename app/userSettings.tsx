import { supabase } from "@/lib/supabase/client";
import { useProfile } from "@/lib/supabase/models/profile";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function UserSettings() {
    const { data: userProfile } = useProfile();

    const [avatar, setAvatar] = useState<string | null>(null);
    const [isModified, setIsModified] = useState(false);

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                isModified ? (
                    <Pressable onPress={saveSettings}>
                        <Text style={styles.headerRightText}>儲存</Text>
                    </Pressable>
                ) : null,
        });
    }, [isModified]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
            setIsModified(true);
        }
    };

    const saveSettings = async () => {
        try {
            console.log("Saving settings with avatar:", avatar);
            let avatarUrl = avatar;
            if (avatar && avatar.startsWith("file://") && userProfile?.user_id) {
                avatarUrl = await uploadAvatar(avatar, userProfile?.user_id);
                console.log("Uploaded avatar URL:", avatarUrl);
            }
            if (avatar && userProfile?.user_id) {
                avatarUrl = await uploadAvatar(avatar, userProfile?.user_id);
                console.log("Uploaded avatar URL:", avatarUrl);
            }

            // 存到 Supabase
            const { error } = await supabase
                .from("profiles")
                .update({ avatarUrl: avatarUrl })
                .eq("user_id", userProfile?.user_id);

            if (error) throw error;

            setIsModified(false);
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={pickImage}>
                <Image
                    source={{ uri: avatar || userProfile?.avatarUrl || "https://picsum.photos/200" }}
                    style={{
                        width: 130,
                        height: 130,
                        borderRadius: 65,
                    }}
                />
            </Pressable>

            <Text style={styles.usernameText}>
                {userProfile?.username || "Username"}
            </Text>

            <View style={styles.boxesContainer}>
                <View style={styles.box}>
                    <Text style={styles.boxTextTop}>test</Text>
                    <Text style={styles.boxTextBottom}>2</Text>
                </View>
                <View style={styles.box}>
                    <Text style={styles.boxTextTop}>test</Text>
                    <Text style={styles.boxTextBottom}>2</Text>
                </View>
                <View style={styles.box}>
                    <Text style={styles.boxTextTop}>test</Text>
                    <Text style={styles.boxTextBottom}>2</Text>
                </View>
            </View>


            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 18, color: "#666" }}>
                    權限：{userProfile?.role === "user"
                        ? "一般使用者"
                        : userProfile?.role === "admin"
                            ? "管理員"
                            : "未知"}
                </Text>
                <Text style={{ fontSize: 18, color: "#666" }}>
                    電子郵件：{userProfile?.email || "No email"}
                </Text>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        flex: 1,
        // backgroundColor: "#d2d3f6",
        paddingTop: 30,
        alignItems: "center",
        // justifyContent: "center",
    },
    headerRightText: {
        fontSize: 20,
        color: "coral",
        marginRight: 12.36,
        fontWeight: "bold"
    },
    usernameText: {
        fontSize: 30,
        fontWeight: "bold",
        marginTop: 15,
        color: "#333"
    },


    boxesContainer: {
        flexDirection: "row",
        width: "100%",
        paddingHorizontal: 30,
        gap: 20,
    },
    box: {
        backgroundColor: "#ffaaaa",
        flex: 1,
        padding: 8,
        alignItems: "center",
        borderRadius: 10,
    },
    boxTextTop: {
        fontWeight: "bold",
        fontSize: 20,
        color: "#660000",
    },
    boxTextBottom: {
        fontSize: 16,
    }

    
    // text: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    // input: {
    //     borderWidth: 1,
    //     borderColor: "#ccc",
    //     padding: 10,
    //     width: "80%",
    //     marginBottom: 20,
    //     borderRadius: 5,
    // },
    // avatar: { width: 100, height: 100, borderRadius: 50, marginTop: 20 },
});


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
