import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function IconRow(
	{icon, info, iconSize, iconColor} 
	: 
	{icon: any, info: string, iconSize?: number, iconColor?: string}
){
	return (
		<View style={styles.container}>
			<Ionicons name={icon} size={iconSize ?? 18} color={iconColor ?? "black"}/>
			<Text style={styles.infoText}>{info}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		gap: 10,
		margin: 8
	},
	infoText: {
		fontSize: 16,
		alignSelf: 'center'
	}
})