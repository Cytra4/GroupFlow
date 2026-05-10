import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Pressable, StyleSheet, ViewStyle } from "react-native";

export interface DialogRef {
    open: () => void;
    close: () => void;
}

interface BaseDialogProps {
    children: React.ReactNode;
    containerStyle?: ViewStyle;
}

export const BaseDialog = forwardRef<DialogRef, BaseDialogProps>(
    ({ children, containerStyle }, ref) => {
        const [visible, setVisible] = useState(false);

        useImperativeHandle(ref, () => ({
            open: () => setVisible(true),
            close: () => setVisible(false),
        }));

        const close = () => setVisible(false);

        return (
            <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
                <Pressable style={styles.overlay} onPress={close}>
                    <Pressable 
                        style={[styles.dialog, containerStyle]} 
                        onPress={(e) => e.stopPropagation()}
                    >
                        {children}
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
});
