import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BaseDialog, DialogRef } from "./BaseDialog"; // 引入剛才拆出的檔案

interface ConfirmProps {
    children: React.ReactNode;
    confirmText: string;
    onConfirm: () => void;
}

export const ConfirmDialog = forwardRef<DialogRef, ConfirmProps>(
    ({ children, confirmText, onConfirm }, ref) => {
        const dialogRef = useRef<DialogRef>(null);

        // 轉發 ref 方法給外部
        useImperativeHandle(ref, () => ({
            open: () => dialogRef.current?.open(),
            close: () => dialogRef.current?.close(),
        }));

        const handleConfirm = () => {
            onConfirm();
            dialogRef.current?.close();
        };

        return (
            <BaseDialog ref={dialogRef}>
                <View style={styles.content}>{children}</View>
                <View style={styles.actions}>
                    <Pressable
                        style={[styles.buttonFormat, { backgroundColor: "coral" }]}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.buttonText}>{confirmText}</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.buttonFormat, { backgroundColor: "#888787ff" }]}
                        onPress={() => dialogRef.current?.close()}
                    >
                        <Text style={styles.buttonText}>取消</Text>
                    </Pressable>
                </View>
            </BaseDialog>
        );
    }
);

const styles = StyleSheet.create({
    content: { marginBottom: 16 },
    actions: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    buttonFormat: { flex: 1, padding: 10, borderRadius: 6 },
    buttonText: { color: "#ffffff", textAlign: "center", fontSize: 16, fontWeight: "bold" }
});
