import { useProfileQuery } from "@/lib/hooks/auth/profile";
import { useInsert } from "@/lib/supabase/query";
import { useQueryClient } from '@tanstack/react-query';
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { DialogRef } from "./UI/BaseDialog";
import { ConfirmDialog } from "./UI/ConfirmDialog";

export const CreateGroup = forwardRef<DialogRef>((_, ref) => {
	const dialogRef = useRef<DialogRef>(null);
	const [groupName, setGroupName] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const profileQuery = useProfileQuery();
	const queryClient = useQueryClient();
	const groupInsertMutation = useInsert();

	// 將控制方法轉發給外部的控制按鈕
	useImperativeHandle(ref, () => ({
		open: () => {
			setGroupName("");
			setError("");
			dialogRef.current?.open();
		},
		close: () => dialogRef.current?.close(),
	}));

	async function handleCreate() {
		if (!groupName.trim()) {
			setError("小組名稱不得為空");
			return;
		}

		setLoading(true);
		setError("");

		try {
			await groupInsertMutation.mutateAsync({
				table: 'groups',
				row: {
					name: groupName.trim(),
					created_by: profileQuery.data?.user_id
				}
			});

			queryClient.invalidateQueries({ queryKey: ['groups'] });
			dialogRef.current?.close();
		}
		catch (err: any) {
			setError("建立小組發生錯誤，請重新嘗試");
			console.log(err);
		}
		finally {
			setLoading(false);
		}
	}

	return (
		<ConfirmDialog
			ref={dialogRef}
			confirmText={loading ? "建立中..." : "建立"}
			onConfirm={handleCreate}
		>
			<View style={styles.dialogContent}>
				<Text style={styles.title}>建立你的小組</Text>
				<TextInput
					style={[styles.input, error ? { borderColor: "#E43636" } : {}]}
					placeholder="請輸入小組名稱"
					placeholderTextColor={"#939393"}
					value={groupName}
					onChangeText={setGroupName}
				/>

				{error ? <Text style={styles.error}>{error}</Text> : null}
			</View>
		</ConfirmDialog>
	);
});

const styles = StyleSheet.create({
	dialogContent: {
		alignItems: "center",
		width: "100%",
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		color: "#333",
	},
	input: {
		width: "100%",
		borderWidth: 2,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		marginTop: 15,
	},
	error: {
		color: "#E43636",
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 16
	}
});
