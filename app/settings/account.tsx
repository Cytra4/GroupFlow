import { StyleSheet, Text, TextInput, View } from "react-native";

export default function AccountSettings() {
    return (
        <View style={styles.container}>
            <Text>帳號設定</Text>
            <View style={styles.verify_box}>
                <Text>驗證</Text>
                <TextInput
                    placeholder="輸入密碼"

                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    verify_box: {
        backgroundColor: "red",
        flexDirection: "row",

        marginHorizontal: 20,
        marginTop: 20,
    }
});
