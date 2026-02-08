import { useGlobalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function DayDetail(){
	const {groupId, date} = useGlobalSearchParams();
	const d = new Date(date.toString());
	const dateDisplay = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDay()+1}日`

	return (
		<View style={styles.container}>
			<Text style={styles.dateText}>{dateDisplay}</Text>
		</View>
	)	
}

const styles =StyleSheet.create({
	container:{
		flex: 1,
		alignItems: "center",
		backgroundColor: "#f8f8f8",
	},
	dateText:{
		fontSize: 20,
		fontWeight: "bold",
		margin: 20
	}
})