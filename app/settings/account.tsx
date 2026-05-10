import { Stack, useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
// 假設你有這些 hooks
import { useUpdatePasswordMutation, useVerifyPasswordMutation } from "@/lib/hooks/auth/user";

export default function AccountSettings() {
	const [step, setStep] = React.useState<"verify" | "update">("verify");
	const [passwords, setPasswords] = React.useState({ old: "", new: "", confirm: "" });
	const [error, setError] = React.useState("");

	const router = useRouter();

	const verifyMutation = useVerifyPasswordMutation();
	const updateMutation = useUpdatePasswordMutation();
	const loadingText = useDotAnimation("處理中");

	// 處理驗證舊密碼
	const handleVerify = () => {
		verifyMutation.mutate(passwords.old, {
			onSuccess: (data) => {
				setError("");
				setStep("update");
				console.log("驗證成功，使用者資料：", data);
			},
			onError: () => setError("密碼錯誤，請重新輸入"),
		});
	};

	// 處理更新密碼
	const handleUpdate = () => {
		console.log("嘗試更新密碼，輸入的密碼：", passwords);
		if (passwords.new !== passwords.confirm) {
			setError("新密碼與確認密碼不符");
			return;
		}
		if (passwords.new.length < 6) {
			setError("新密碼長度至少需要 6 位");
			return;
		}

		updateMutation.mutate(passwords.new, {
			onSuccess: () => {
				Alert.alert("成功", "密碼已更新");
				// 成功後可以考慮跳回上一頁或重設狀態
				router.back();
			},
			onError: (err) => setError(err.message),
		});
	};

	const isPending = verifyMutation.isPending || updateMutation.isPending;

	return (
		<>
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable onPress={step === "verify" ? handleVerify : handleUpdate} disabled={isPending}>
							<Text style={styles.saveText}>
								{isPending ? loadingText : step === "verify" ? "下一步" : "確定修改"}
							</Text>
						</Pressable>
					),
				}}
			/>
			<View style={styles.container}>
				<View style={styles.inputBoxes}>
					{step === "verify" ? (
						<LabelInput
							label="請輸入舊密碼以驗證身份"
							value={passwords.old}
							type="password"
							onChange={(text) => setPasswords({ ...passwords, old: text })}
							error={error}
						/>
					) : (
						<>
							<LabelInput
								label="新密碼"
								value={passwords.new}
								type="password"
								onChange={(text) => setPasswords({ ...passwords, new: text })}
							/>
							<LabelInput
								label="確認新密碼"
								value={passwords.confirm}
								type="password"
								onChange={(text) => setPasswords({ ...passwords, confirm: text })}
								error={error}
							/>
						</>
					)}
				</View>
			</View>
		</>
	);
}

// 複用你之前的 styles
const styles = StyleSheet.create({
	// ... 直接套用 ProfileSettings 的 styles ...
	saveText: {
		marginRight: 20,
		color: "coral",
		fontSize: 16,
	},
	container: {
		flex: 1,
		backgroundColor: "#fefefe",
		paddingHorizontal: 20,
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
	},
});

type LabelInputProps = {
	label: string;
	value: string;
	type?: "text" | "email" | "password";
	onChange?: (text: string) => void;
	error?: string;
}

const LabelInput = ({ label, value, type = "text", onChange, error }: LabelInputProps) => (
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
		{Boolean(error) && <Text style={styles.errorMsg}>{error}</Text>}
	</View>
);


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