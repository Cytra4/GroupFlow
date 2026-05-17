import { GroupMember, useGroupMembers } from "@/lib/hooks/useGroupMembers";
import { useAddNewTask } from "@/lib/supabase/models/task";
import { wp } from "@/scripts/constants";
import { useGlobalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import { Button } from "./Button";
import DatePicker from "./datePicker/DatePicker";
import TimePicker from "./datePicker/TimePicker";
import { Loading } from "./Loading";
import { PressableOpacity } from "./PressableOpacity";

// finished > due = 完成
// unfinished > due = 逾期
// unfinished > start = 進行中
// unfinished < start = 尚未開始

export default function AddTask() {
	const [visible, setVisible] = useState(false);
	const [taskTitle, setTaskTitle] = useState<string>("");
	const [taskContent, setTaskContent] = useState<string>("");

	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date>(new Date());
	const [startTime, setStartTime] = useState<string>("00:00");
	const [endTime, setEndTime] = useState<string>("00:00");

	const [priority, setPriority] = useState<number>(1);

	const [addError, setError] = useState<string>("");
	const [errorCode, setErrorCode] = useState<number>(0);
	const [isSubmitting, setSubmitting] = useState<boolean>(false);

	//紀錄要指派任務給哪些成員
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const { addTask } = useAddNewTask();

	//取小組內的所有成員
	const { groupId } = useGlobalSearchParams<{ groupId: string }>();
	const {
		data: groupMembers,
		isLoading,
		error,
	} = useGroupMembers(groupId);

	//處理任務的成員選取
	const toggleMember = (userID: string) => {
		setSelectedUserIds((prev) =>
			prev.includes(userID)
				? prev.filter((id) => id !== userID)
				: [...prev, userID]
		)
	}

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

				<Image
					source={{ uri: item.profiles.avatarUrl || "https://picsum.photos/200" }}
					style={{
						width: 35,
						height: 35,
						borderRadius: 65,
						marginHorizontal: 8
					}}
				/>

				<Text style={styles.memberName}>
					{item.profiles.username}
				</Text>
			</Pressable>
		);
	};

	const timeToMinutes = (time: string) => {
		const [h, m] = time.split(":").map(Number);
		return h * 60 + m;
	};

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

		const sameDay =
			startDate.toDateString() === endDate.toDateString();

		if (sameDay) {
			const startMin = timeToMinutes(startTime);
			const endMin = timeToMinutes(endTime);

			if (startMin >= endMin) {
				setError("同一天時，開始時間必須早於結束時間");
				setErrorCode(3);
				return false;
			}
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

	const dataReset = () => {
		setTaskTitle("");
		setTaskContent("");
		setStartDate(new Date());
		setEndDate(new Date());
		setPriority(1);
		setSelectedUserIds([]);
		setError("");
		setErrorCode(0);
	}

	const combineDateTime = (date: Date, time: string) => {
		const [hours, minutes] = time.split(":").map(Number);
		const newDate = new Date(date);
		newDate.setHours(hours);
		newDate.setMinutes(minutes);
		newDate.setSeconds(0);
		return newDate;
	};

	const handleAdd = async () => {
		if (!errorCheck()) return;

		try {
			setSubmitting(true);

			await addTask(
				groupId,
				taskTitle,
				taskContent,
				priority,
				combineDateTime(startDate, startTime),
				combineDateTime(endDate, endTime),
				selectedUserIds
			);

			setVisible(false);
			dataReset();
		}
		catch (err: any) {
			setError(err.message ?? "新增任務失敗，請重新嘗試");
		}
		finally {
			setSubmitting(false);
		}
	}

	return (
		<>
			<PressableOpacity
				onPress={() => setVisible(true)}
			>
				<Text
					style={{
						fontSize: 20, color: 'coral',
						fontWeight: 'bold', marginRight: wp(3)
					}}
				>
					新增任務
				</Text>
			</PressableOpacity>

			<Modal
				transparent
				animationType="fade"
				visible={visible}
				onRequestClose={() => setVisible(false)}
				statusBarTranslucent
			>
				<View style={styles.centeredView}>
					<Pressable
						style={StyleSheet.absoluteFill}
						onPress={() => setVisible(false)}
					/>

					<View style={styles.modalView}>
						<Text style={styles.modalTitle}>新增任務</Text>
						<ScrollView
							style={styles.formScroll}
							contentContainerStyle={styles.formScrollContent}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
						>
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
								<TimePicker
									value={startTime}
									onChange={setStartTime}
								/>
							</View>

							<View style={styles.inputRow}>
								<DatePicker
									label="結束日期"
									value={endDate}
									onChange={setEndDate}
									pickerStyle={[styles.picker, (errorCode == 3) && styles.errorInput]}
								/>
								<TimePicker
									value={endTime}
									onChange={setEndTime}
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

								<View style={styles.memberList}>
									{groupMembers?.map((item) => (
										<View key={item.id}>
											{renderMember({ item })}
										</View>
									))}
								</View>
							</View>

							{addError ? <Text style={styles.error}>{addError}</Text> : null}

							<View style={styles.buttonRow}>
								<Button
									buttonStyle={[styles.button, styles.join]}
									textStyle={styles.buttonText}
									title="新增"
									onPress={handleAdd}
									loading={isSubmitting}
								/>

								<Button
									buttonStyle={[styles.button, styles.cancel]}
									textStyle={styles.buttonText}
									title="取消"
									onPress={() => {
										dataReset();
										setVisible(false);
									}}
								/>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.3)",
	},
	modalView: {
		width: "95%",
		maxHeight: "85%",
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25)',

		elevation: 5,
	},
	formScroll: {
		width: "100%",
	},
	formScrollContent: {
		paddingBottom: 20,
	},
	memberList: {
		maxHeight: 180,
	},
	modalTitle: {
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
		width: "50%",
		justifyContent: 'center',
		height: 40
	},
	error: {
		fontSize: 18,
		marginBottom: 10,
		color: "#E43636",
		fontWeight: 'bold',
		alignSelf: 'center'
	},
	errorInput: {
		borderColor: "#E43636"
	},
	pickerInputIOS: {
		textAlign: 'center',
		justifyContent: 'center',
		alignContent: 'center',
	}
});