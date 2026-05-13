import { wp } from "@/scripts/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { PressableOpacity } from "../PressableOpacity";

export default function TaskSection({
	title, count,
	isOpen, onToggle,
	children
}: {
	title: string,
	count: number,
	isOpen: boolean,
	onToggle?: () => void,
	children?: any
}) {
	return (
		<View style={styles.section}>
			<PressableOpacity PressStyle={styles.header}
				onPress={onToggle}
			>
				<Text style={styles.title}>{title} ({count})</Text>
				<Ionicons
					name={isOpen ? "chevron-down-circle" : "chevron-forward-circle"}
					size={30}
					style={{ alignSelf: 'center' }}
					color={isOpen ? "coral" : "black"}
				/>
			</PressableOpacity>
			{isOpen && <View style={styles.content}>{children}</View>}
			{isOpen && <View style={styles.line} />}
		</View>
	)
}

const styles = StyleSheet.create({
	section: {
		marginVertical: 16,
		overflow: "hidden",
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 14,
		borderWidth: 2,
		borderRadius: 40,
		backgroundColor: '#fff',

		boxShadow: '1px 2px 5px rgba(0, 0, 0, 0.2)',
		elevation: 2,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginRight: wp(40),
		marginLeft: wp(2)
	},
	content: {
		marginTop: 12,
		padding: 12,
		gap: 10,
	},
	line: {
		borderTopWidth: 2,
		marginTop: 16,
		borderStyle: 'solid',
	}
})