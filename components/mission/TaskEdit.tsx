import { useDeleteTask } from "@/lib/hooks/useDeleteTask";
import { GroupMember, useGroupMembers } from "@/lib/hooks/useGroupMembers";
import { useTaskMembers } from "@/lib/hooks/useTaskMembers";
import { useUpdateTask, useUpdateTaskMembers } from "@/lib/hooks/useUpdateTask";
import { wp } from "@/scripts/constants";
import { Task } from "@/types/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import { Button } from "../Button";
import { Loading } from "../Loading";
import { PressableOpacity } from "../PressableOpacity";
import DatePicker from "../datePicker/DatePicker";

export default function TaskEdit(
	{ iconColor, iconSize, iconStyle, taskData }
		:
		{
			iconColor?: string, iconSize?: number,
			iconStyle?: object, taskData?: Task,
		}
) {

	const [visible, setVisible] = useState<boolean>(false);

	const [taskTitle, setTaskTitle] = useState<string>(taskData?.title ?? "");
	const [taskContent, setTaskContent] = useState<string>(taskData?.description ?? "");
	const [startDate, setStartDate] = useState<Date>(
		taskData?.start_date ?
			new Date(taskData?.start_date) :
			new Date()
	);
	const [endDate, setEndDate] = useState<Date>(
		taskData?.due_date ?
			new Date(taskData?.due_date) :
			new Date()
	);
	const [priority, setPriority] = useState<number>(taskData?.priority ?? 1);

	const [addError, setError] = useState<string>("");
	const [errorCode, setErrorCode] = useState<number>(0);
	const [isSubmitting, setSubmitting] = useState<boolean>(false);
	const [isDeleting, setDeleting] = useState<boolean>(false);

	const { groupId } = useGlobalSearchParams<{ groupId: string }>();
	const {
		data: groupMembers,
		isLoading,
		error,
	} = useGroupMembers(groupId);

	const toggleMember = (userID: string) => {
		setSelectedUserIds((prev) =>
			prev.includes(userID)
				? prev.filter((id) => id !== userID)
				: [...prev, userID]
		)
	}

	//取得原本有參與任務的成員
	const { data: taskMembersData } = useTaskMembers(taskData?.id ?? 0);

	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	useEffect(() => {
		if (taskMembersData) {
			setSelectedUserIds(taskMembersData.map(m => m.user_id));
		}
	}, [taskMembersData]);

	//TO BE DONE
	//* 這邊之後除了名稱以外應該也要加上成員頭像
	const renderMember = ({ item }: { item: GroupMember }) => {
		const userID = item.user_id;
		const checked = selectedUserIds.includes(userID);

		return (
			<Pressable
				style={styles.memberRow}
				onPress={() => toggleMember(userID)}
			>
				<View
					style={[styles.checkbox,
					checked && styles.checkboxChecked,
					(errorCode == 4 && !checked) && styles.errorInput
					]}
				>
					{checked && <Text style={styles.checkmark}>✓</Text>}
				</View>

				<Text style={styles.memberName}>
					{item.profiles.username}
				</Text>
			</Pressable>
		);
	};

	const { mutateAsync: updateTask } = useUpdateTask();
	const { mutateAsync: updateTaskMembers } = useUpdateTaskMembers();

	const errorCheck = () => {
		if (!taskTitle) {
			setError("請輸入任務名稱");
			setErrorCode(1);
			return false;
		}
		if (!taskContent) {
			setError("請輸入任務內容");
			setErrorCode(2);
			return false;
		}
		if (startDate > endDate) {
			setError("開始日期需要在結束日期之前");
			setErrorCode(3);
			return false;
		}
		if (selectedUserIds.length === 0) {
			setError("請至少選擇一名任務成員");
			setErrorCode(4);
			return false;
		}
		setError("");
		setErrorCode(0);
		return true;
	}

	const handleUpdate = async () => {
		if (!errorCheck()) return;
		if (!taskData) return;

		try {
			setSubmitting(true);

			await updateTask({
				taskId: taskData?.id,
				groupId: groupId,
				taskTitle,
				taskContent,
				startDate,
				endDate,
				priority
			});

			await updateTaskMembers({
				taskId: taskData!.id,
				groupId: groupId,
				newUserIds: selectedUserIds,
				currentUserIds: taskMembersData?.map(m => m.user_id) ?? []
			});

			setVisible(false);
		}
		catch (err: any) {
			setError(err.message ?? "更新任務失敗，請重新嘗試");
		}
		finally {
			setSubmitting(false);
		}
	}

	const { mutateAsync: deleteTask } = useDeleteTask();

	const handleDeleteTask = async () => {
		if (!taskData) return;

		try{
			setDeleting(true)

			await deleteTask({
				taskId: taskData.id,
				groupId: groupId
			})

			setVisible(false)
		}
		catch(err: any){
			setError(err.message ?? "刪除失敗，請稍後再重新嘗試")
		}
		finally{
			setDeleting(false)
		}
	}

	const handleDeleteConfirm = () => {
		Alert.alert(
			"刪除任務",
			"確定要刪除任務嗎？ 此操作將無法復原",
			[
				{
					text: "確認",
					style: "destructive",
					onPress: handleDeleteTask 
				},
				{
					text: "取消",
					style: "cancel"
				}
			]
		)
	}

	return (
		<>
			<PressableOpacity
				PressStyle={[styles.iconButton, iconStyle]}
				onPress={() => setVisible(true)}
			>
				<Ionicons name="settings-outline" size={iconSize ?? 30} color={iconColor ?? "blue"} />
			</PressableOpacity>

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
							<View style={[styles.modalView, { borderWidth: 3.5, borderColor: iconColor ?? "blue" }]}>
								<Text style={styles.title}>修改任務</Text>

								<View style={styles.inputRow}>
									<Text style={styles.inputTitle}>任務名稱</Text>
									<TextInput
										style={[styles.input, (errorCode == 1) && styles.errorInput]}
										placeholder="ex: 企劃書撰寫, 整理資料, 偷懶"
										placeholderTextColor={"#939393"}
										value={taskTitle}
										onChangeText={setTaskTitle}
									/>
								</View>

								<View style={styles.inputRow}>
									<Text style={styles.inputTitle}>任務內容</Text>
									<TextInput
										style={[styles.input, (errorCode == 2) && styles.errorInput]}
										placeholder="ex: 將程式完成並推上Github"
										placeholderTextColor={"#939393"}
										value={taskContent}
										onChangeText={setTaskContent}
									/>
								</View>

								<View style={styles.inputRow}>
									<DatePicker
										label="開始日期"
										value={startDate}
										onChange={setStartDate}
										pickerStyle={[styles.picker, (errorCode == 3) && styles.errorInput]}
									/>
								</View>

								<View style={styles.inputRow}>
									<DatePicker
										label="結束日期"
										value={endDate}
										onChange={setEndDate}
										pickerStyle={[styles.picker, (errorCode == 3) && styles.errorInput]}
									/>
								</View>

								<View style={styles.inputRow}>
									<Text style={styles.inputTitle}>任務優先度</Text>
									<View style={styles.priorPicker}>
										<RNPickerSelect
											onValueChange={(itemValue, itemIndex) =>
												setPriority(itemValue)
											}
											placeholder={{}}
											items={[
												{ label: '1 (高度優先)', value: 1 },
												{ label: '2 (中高度優先)', value: 2 },
												{ label: '3 (中度優先)', value: 3 },
												{ label: '4 (中低度優先)', value: 4 },
												{ label: '5 (低度優先)', value: 5 },
											]}
											style={{
												inputIOS: styles.pickerInputIOS,
												inputIOSContainer: {
													zIndex: 100,
												},
											}}
											pickerProps={{
												itemStyle: {
													color: 'black'
												}
											}}
										/>
									</View>
								</View>

								<View style={styles.inputRow}>
									<Text style={styles.inputTitle}>任務成員</Text>
									{isLoading &&
										<View>
											<Loading />
											<Text style={styles.loadingText}>載入成員中...</Text>
										</View>
									}

									{error ? <Text>{error.message}</Text> : null}

									<FlatList
										data={groupMembers}
										keyExtractor={(item) => item.id}
										renderItem={renderMember}
										showsVerticalScrollIndicator={false}
									/>
								</View>

								{addError ? <Text style={styles.error}>{addError}</Text> : null}

								<View style={styles.buttonRow}>
									<Button
										buttonStyle={[styles.button, styles.join]}
										textStyle={styles.buttonText}
										title="更新任務"
										onPress={handleUpdate}
										loading={isSubmitting}
									/>

									{/* TO BE DONE */}
									<Button
										buttonStyle={[styles.button, styles.delete]}
										textStyle={styles.buttonText}
										title="刪除任務"
										onPress={() => {
											handleDeleteConfirm()
										}}
									/>

									<Button
										buttonStyle={[styles.button, styles.cancel]}
										textStyle={styles.buttonText}
										title="取消"
										onPress={() => {
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
		width: "95%",
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	iconButton: {
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	button: {
		flex: 1,
		marginHorizontal: 5,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	cancel: {
		backgroundColor: "#888787ff",
	},
	join: {
		backgroundColor: "coral",
	},
	delete: {
		backgroundColor: '#F63049'
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 18
	},
	input: {
		width: "100%",
		borderWidth: 1.8,
		borderColor: "#b0b0b0",
		borderRadius: 8,
		padding: 10,
	},
	inputRow: {
		width: "100%",
		marginBottom: 10
	},
	inputTitle: {
		fontSize: 16,
		marginBottom: 5,
		marginLeft: 3
	},
	picker: {
		borderWidth: 2,
		borderRadius: 1,
		borderColor: "#b0b0b0",
	},
	loadingText: {
		fontSize: 16,
		alignSelf: 'center'
	},
	memberRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderWidth: 2,
		borderColor: "#b0b0b0",
		borderRadius: 4,
		marginRight: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	checkboxChecked: {
		backgroundColor: "coral",
		borderColor: "coral",
	},
	checkmark: {
		color: "white",
		fontWeight: "bold",
	},
	memberName: {
		fontSize: 16,
	},
	priorPicker: {
		borderWidth: 2,
		borderRadius: 8,
		borderColor: "#b0b0b0",
		width: wp(40),
		justifyContent: 'center',
		height: 40
	},
	error: {
		fontSize: 18,
		marginBottom: 10,
		color: "#E43636",
		fontWeight: 'bold'
	},
	errorInput: {
		borderColor: "#E43636"
	},
	pickerInputIOS: {
		textAlign: 'center',
		justifyContent: 'center',
		alignContent: 'center',
	}
})