import { Button } from '@/components/Button';
import CustomInput from '@/components/CustomInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useSignIn } from '@/lib/supabase/auth';
import { useAuth } from '@/scripts/AuthContext';
import { hp, wp } from '@/scripts/constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Login() {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string | null>("");
	const router = useRouter();

	const signInMutation = useSignIn();
	const { user } = useAuth();

	async function SignIn() {
		if (!email || !password) {
			setError("請輸入信箱與密碼");
			return;
		}

		signInMutation.mutate({
			email: email.trim(),
			password: password.trim(),
		}, {
			onSuccess: () => {
				setError(null);
				router.replace("/");
			},
			onError: () => {
				setError("登入失敗，請確認信箱與密碼是否正確");
			}
		});
	}

	React.useEffect(() => {
		if (user) {
			router.replace("/");
		}
	}, [user]);

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
						<Text style={styles.welcome}>歡迎回來</Text>
					</View>

					<CustomInput
						placeholder="信箱"
						onChange={setEmail}
						boxStyle={[{ marginBottom: 30 }, error && { borderColor: "#E43636" }]}
						iconName='mail'
						keyboardType='email-address'
					/>

					<CustomInput
						placeholder="密碼"
						onChange={setPassword}
						boxStyle={[error && { borderColor: "#E43636" }]}
						iconName="lock"
						secureText={true}
					/>

					{error ? <Text style={styles.error}>{error}</Text> : null}

					<Button
						title="登入"
						buttonStyle={styles.button}
						loading={signInMutation.isPending}
						onPress={SignIn}
					/>

					<View style={{ flexDirection: "row" }}>
						<Text style={styles.switchText}>還沒有帳號？</Text>
						<Pressable
							onPress={() => router.replace("/signUp")}
						>
							<Text
								style={[styles.switchText, { fontWeight: "bold", color: "coral" }]}
							>
								建立帳號
							</Text>
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>
		</ScreenWrapper>
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
		fontWeight: "bold",
		fontSize: 18,
		marginTop: 5
	}
})