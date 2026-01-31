import { wp } from "@/scripts/constants";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

export default function AddTask() {
	const [visible, setVisible] = useState(false);

	return (
		<>
			<Pressable
				onPress={() => setVisible(true)}
			>
				<Text
					style={{
						fontSize: 20, color: 'coral',
						fontWeight: 'bold', marginRight: wp(3)
					}}
				>
					加入任務
				</Text>
			</Pressable>

			<Modal
				transparent
				animationType="fade"
				visible={visible}
				onRequestClose={() => setVisible(false)}
				statusBarTranslucent
			>
				<TouchableWithoutFeedback>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Text style={styles.modalTitle}>加入小組</Text>
							<Pressable onPress={() => { setVisible(false)}}>
								<Text>取消</Text>
							</Pressable>
						</View>
					</View>
				</TouchableWithoutFeedback>
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
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	}
});