import eventBus from '@/lib/eventBus';
import { useJoinGroup } from '@/lib/supabase/models/group';
import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function JoinGroup() {
	const [error, setError] = useState<string>("");
	const [code, setCode] = useState<string>("");
	const [visible, setVisible] = useState(false);

	const joinGroupMutation = useJoinGroup();

	const handleJoin = () => {
		if (!code) {
			setError('小組代碼不得為空');
		} else {
			joinGroupMutation.mutate(
				{ groupCode: code.trim() },
				{
					onError: (error: any) => setError(error.message),
					onSuccess: () => setVisible(false),
				}
			);
		}
	};

	useEffect(() => {
		const handler = (groupCode?: string) => {
			openModal(groupCode);
		};
		eventBus.on('openJoinGroup', handler);

		return () => {
			eventBus.off('openJoinGroup', handler);
		};
	}, []);

	function openModal(code?: string) {
		setCode(code ?? '');
		setError('');
		setVisible(true);
	}

	return (
		<>
			<Feather
				name="plus"
				size={28}
				style={{ marginRight: 16 }}
				onPress={() => openModal()}
			/>

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
						<Text style={styles.modalTitle}>加入小組</Text>

						<TextInput
							style={[styles.input, error ? styles.errorInput : {}]}
							placeholder="請輸入小組代碼"
							placeholderTextColor={"#939393"}
							value={code}
							onChangeText={setCode}
						/>

						{error ? <Text style={styles.error}>{error}</Text> : null}

						<View style={styles.buttonRow}>
							<Pressable
								style={[styles.button, styles.join]}
								onPress={handleJoin}
								disabled={joinGroupMutation.isPending}
							>
								<Text style={styles.buttonText}>加入</Text>
							</Pressable>

							<Pressable style={[styles.button, styles.cancel]} onPress={() => setVisible(false)}>
								<Text style={styles.buttonText}>取消</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
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
	},
	input: {
		width: "100%",
		borderWidth: 2,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		marginBottom: 15,
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
	},
	error: {
		color: "#E43636",
		marginBottom: 15,
		fontWeight: "bold"
	},
	errorInput: {
		borderColor: "#E43636"
	}
});
