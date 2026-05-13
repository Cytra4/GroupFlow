import { wp } from "@/scripts/constants";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TimerPickerModal } from "react-native-timer-picker";
import { PressableOpacity } from "../PressableOpacity";

type Props = {
	value: string;
	onChange: (time: string) => void;
};

export default function TimePicker({ value, onChange }: Props) {
	const [showPicker, setShowPicker] = useState(false);

	const formatTime = ({
		hours,
		minutes,
	}: {
		hours?: number;
		minutes?: number;
	}) => {
		const timeParts = [];

		if (hours !== undefined) {
			timeParts.push(hours.toString().padStart(2, "0"));
		}
		if (minutes !== undefined) {
			timeParts.push(minutes.toString().padStart(2, "0"));
		}

		return timeParts.join(":");
	};

	return (
		<View style={styles.container}>
			<Text style={styles.time}>
				{"時間：" + value}
			</Text>
			<PressableOpacity
				onPress={() => setShowPicker(true)}
				PressStyle={styles.buttonWrapper}
			>
				<Text style={styles.button}>設定時間</Text>
			</PressableOpacity>
			<TimerPickerModal
				hideSeconds
				closeOnOverlayPress
				LinearGradient={LinearGradient}
				modalTitle="設定時間"
				hourLabel={"點"}
				minuteLabel={"分"}
				confirmButtonText="確認"
				cancelButtonText="取消"
				onCancel={() => setShowPicker(false)}
				onConfirm={(pickedDuration) => {
					const time = formatTime(pickedDuration);
					onChange(time);
					setShowPicker(false);
				}}
				setIsVisible={setShowPicker}
				styles={{
					theme: "light",
					pickerColumnWidth: {
						hours: 90,
					},
					contentContainer: {
						width: wp(70),
					},
					pickerContainer: {
						justifyContent: "center",
					},
				}}
				visible={showPicker}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 12,
		marginTop: 10
	},
	time: {
		fontSize: 18,
		color: "#202020"
	},
	buttonWrapper: {
		marginLeft: 16,
	},
	button: {
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderWidth: 1.5,
		borderRadius: 10,
		fontSize: 16,
		overflow: "hidden",
		borderColor: "#8C8C8C",
	}
})