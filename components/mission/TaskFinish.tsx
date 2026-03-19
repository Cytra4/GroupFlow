import { useFinishTask } from "@/lib/hooks/useUpdateTask";
import { Task } from "@/types/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams } from "expo-router";
import { Alert, StyleSheet } from "react-native";
import { PressableOpacity } from "../PressableOpacity";

export default function TaskFinish(
	{ iconColor, iconSize, iconStyle, taskData }
		:
		{
			iconColor?: string, iconSize?: number,
			iconStyle?: object, taskData?: Task,
		}
) {

	const { groupId } = useGlobalSearchParams<{ groupId: string }>();

	const { mutateAsync: finishTask } = useFinishTask();

	const handleFinishTask = async () => {
		if (!taskData) return;

		try {

			await finishTask({
				taskId: taskData.id,
				groupId: groupId
			})

		}
		catch (err: any) {
			console.log({err})
		}
		finally {

		}
	}

	const handleFinishConfirm = () => {
		Alert.alert(
			"完成任務",
			"確定要將此任務設為「完成」嗎？\n*已完成的任務無法再做修改*",
			[
				{
					text: "確認",
					style: "destructive",
					onPress: handleFinishTask
				},
				{
					text: "取消",
					style: "cancel"
				}
			]
		)
	}

	return (
		<PressableOpacity
			PressStyle={[styles.iconButton, iconStyle]}
			onPress={handleFinishConfirm}
		>
			<Ionicons name="checkmark-sharp" size={iconSize ?? 30} color={iconColor ?? "blue"} />
		</PressableOpacity>
	)
}

const styles = StyleSheet.create({
	iconButton: {
		alignItems: "center",
		justifyContent: "center",
	},
})