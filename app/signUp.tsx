import { Button } from '@/components/Button';
import CustomInput from '@/components/CustomInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useForm } from '@/lib/hooks/useForm';
import { useSignUp } from '@/lib/supabase/auth';
import { hp, wp } from '@/scripts/constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

export default function SignUp() {
	const [error, setError] = useState<string | null>("");
	const [errorCode, setErrorCode] = useState<number>(0);
	const router = useRouter();

	const signUpForm = useForm({ username: '', email: '', password: '' });
	const signUpMutation = useSignUp();

	function HandleSignUp() {
		const { username, email, password } = signUpForm.values;

		if (!username) {
			setError("請輸入使用者名稱");
			setErrorCode(1);
			return;
		}
		if (!email || !password) {
			setError("請輸入信箱與密碼");
			setErrorCode(2);
			return;
		}
		if (password.length < 6) {
			setError("密碼長度不能少於六位")
			setErrorCode(3);
			return;
		}

		signUpMutation.mutate({
			email: email.trim(),
			password: password.trim(),
			username: username.trim(),
		}, {
			onSuccess: () => {
				console.log("User create success.")
				setError(null);
				router.replace("/");
            },
            onError: () => {
                setError("註冊失敗，請確認信箱與密碼是否正確");
            }
		});
	}

	return (
		<ScreenWrapper bg="white">
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View style={styles.container}>
					<Image
						source={require("../assets/images/logo2.png")}
						resizeMode="contain"
						style={styles.logo}
					/>

					<View style={{ marginBottom: hp(4) }}>
						<Text style={styles.title}>— 協作 ◆ 任務 ◆ 進度 ◆ 同步 —</Text>
					</View>

					<View style={{ marginBottom: hp(3) }}>
						<Text style={styles.welcome}>馬上加入</Text>
					</View>

					<CustomInput
						placeholder="使用者名稱"
						onChange={(t) => signUpForm.onChange('username', t)}
						boxStyle={[{ marginBottom: 25 }, (errorCode === 1) && { borderColor: "#E43636" }]}
						iconName='user'
					/>

					<CustomInput
						placeholder="信箱"
						onChange={(t) => signUpForm.onChange('email', t)}
						boxStyle={[{ marginBottom: 25 }, (errorCode === 2) && { borderColor: "#E43636" }]}
						iconName='mail'
						keyboardType='email-address'
					/>

					<CustomInput
						placeholder="密碼"
						onChange={(t) => signUpForm.onChange('password', t)}
						boxStyle={[(errorCode >= 2) && { borderColor: "#E43636" }]}
						iconName='lock'
						secureText={true}
					/>

					{error ? <Text style={styles.error}>{error}</Text> : null}

					<Button
						title="申請"
						buttonStyle={styles.button}
						loading={signUpMutation.isPending}
						onPress={HandleSignUp}
					/>

					<View style={{ flexDirection: "row" }}>
						<Text style={styles.switchText}>已經有帳號了？</Text>
						<Text
							onPress={() => router.replace("/login")}
							style={[styles.switchText, { fontWeight: "bold", color: "coral" }]}
						>
							登入帳號
						</Text>
					</View>
				</View>
			</KeyboardAvoidingView>
		</ScreenWrapper >
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "white",
		paddingHorizontal: wp(4)
	},
	logo: {
		height: hp(25),
        alignSelf: "center"
	},
	title: {
		fontSize: 18,
		marginTop: 5
	},
	welcome: {
		fontSize: 25
	},
	switchText: {
		fontSize: 18,
	},
	button: {
		width: wp(50),
		marginTop: 25,
		marginBottom: 20
	},
	error: {
		color: "#E43636",
		fontSize: 18,
		marginTop: 5
	}
})