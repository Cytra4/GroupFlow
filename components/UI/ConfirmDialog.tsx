import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export interface ConfirmDialogRef {
    open: () => void;
    close: () => void;
}

interface DialogProps {
    children: React.ReactNode;
    confirmText: string;
    onConfirm: () => void;
}

export const ConfirmDialog = forwardRef<ConfirmDialogRef, DialogProps>(
    ({ children, confirmText, onConfirm }, ref) => {
        const [visible, setVisible] = useState(false);

        useImperativeHandle(ref, () => ({
            open: () => setVisible(true),
            close: () => setVisible(false),
        }));

        const close = () => setVisible(false);

        return (
            <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
                {/* 1. 將最外層 View 改為 Pressable 並綁定 close */}
                <Pressable style={styles.overlay} onPress={close}>

                    {/* 2. 內層對話框需要另一個 Pressable 並攔截點擊事件 (stopPropagation) */}
                    {/* 這樣點擊對話框內部時，就不會觸發外層的 close */}
                    <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>

                        <View style={styles.content}>{children}</View>

                        <View style={styles.actions}>
                            <Pressable
                                style={[styles.buttonFormat, { backgroundColor: "coral" }]}
                                onPress={() => {
                                    onConfirm();
                                    close();
                                }}
                            >
                                <Text style={styles.buttonText}>{confirmText}</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.buttonFormat, { backgroundColor: "#888787ff" }]}
                                onPress={close}
                            >
                                <Text style={styles.buttonText}>取消</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        );

    }
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    dialog: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        width: "80%",
    },
    content: {
        marginBottom: 16,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    buttonFormat: {
        flex: 1,
        padding: 10,
        borderRadius: 6,
        alignContent: "center",

    },
    buttonText: {
        color: "#ffffff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
    }
});
