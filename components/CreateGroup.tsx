import { useProfile } from "@/lib/supabase/models/profile";
import { useInsert } from "@/lib/supabase/query";
import { hp } from "@/scripts/constants";
import { useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Button } from "./Button";

export default function CreateGroup() {
	const [visible, setVisible] = useState<boolean>(false);
	const [groupName, setGroupName] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const profileQuery = useProfile();
	const queryClient = useQueryClient();
	const groupInsertMutation = useInsert();

	async function HandleJoin() {
		if (!groupName) {
			setError("小組名稱不得為空");
			return;
		}

		setLoading(true);
		setError("");

		try {
			await groupInsertMutation.mutateAsync({
				table: 'groups', row: {
					name: `${groupName}`,
					created_by: profileQuery.data?.user_id
				}
			});

			queryClient.invalidateQueries({ queryKey: ['groups', profileQuery.data?.user_id] });
			setGroupName("");
			setVisible(false);
		}
		catch (err: any) {
			setError("建立小組發生錯誤，請重新嘗試")
			console.log(err)
		}
		finally {
			setLoading(false);
		}
	}

	return (
		<>
			<Button
				title="建立小組"
				onPress={() => setVisible(true)}
				buttonStyle={styles.button}
			/>

			<Modal
				transparent
				animationType="fade"
				visible={visible}
				onRequestClose={() => setVisible(false)}
				statusBarTranslucent
			>
				<TouchableWithoutFeedback
					onPress={() => setVisible(false)}
				>
					<View style={styles.centeredView}>
						<TouchableWithoutFeedback>
							<View style={styles.modalView}>
								<Text style={styles.title}>建立你的小組</Text>
								<TextInput
									style={[styles.input, error && {borderColor: "#E43636"}]}
									placeholder="請輸入小組名稱"
									value={groupName}
									onChangeText={setGroupName}
								/>

								{ error &&
									<Text style={styles.error}>{error}</Text>
								}

								<View style={{ flexDirection: 'row' }}>
									<Button
										title="建立"
										buttonStyle={[styles.modalButton, styles.createButton]}
										textStyle={styles.buttonText}
										onPress={HandleJoin}
										loading={loading}
									/>
									
									<Button
										title="取消"
										buttonStyle={[styles.modalButton, styles.cancelButton]}
										textStyle={styles.buttonText}
										onPress={() => {
											setGroupName("");
											setError("");
											setVisible(false);
										}}
									/>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.3)'
	},
	modalView: {
		width: "80%",
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	button: {
		borderRadius: 6,
		paddingHorizontal: 25,
		margin: 10
	},
	modalButton: {
		borderRadius: 5,
		marginHorizontal: 12,
		paddingHorizontal: 30,
		height: hp(5)
	},
	buttonText: {
		fontSize: 18
	},
	cancelButton: {
		backgroundColor: "#888787ff"
	},
	createButton: {
		backgroundColor: "coral"
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	input: {
		width: "100%",
		borderWidth: 2,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		marginVertical: 15,
	},
	error: {
		color: "#E43636",
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 16
	}
})