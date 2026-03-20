import { StyleSheet, Text, View } from "react-native";

export default function AccountSettings() {
    return (
        <View style={styles.container}>
            <Text>帳號設定</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
});
