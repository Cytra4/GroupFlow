import { hp, wp } from "@/scripts/constants";
import { Picker } from "@react-native-picker/picker";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
	label?: string;
	value: Date;
	onChange: (date: Date) => void;
	minDate?: Date;
	pickerStyle?: object;
};

export default function DatePicker({
	label,
	value,
	onChange,
	minDate,
	pickerStyle,
}: Props) {
	const year = value.getFullYear();
	const month = value.getMonth() + 1;
	const day = value.getDate();

	const years = useMemo(() => {
		const current = new Date().getFullYear() - 5;
		return Array.from({ length: 11 }, (_, i) => current + i);
	}, []);

	const daysInMonth = useMemo(() => {
		return new Date(year, month, 0).getDate();
	}, [year, month]);

	const updateDate = (y = year, m = month, d = day) => {
		const next = new Date(y, m - 1, d);
		if (minDate && next < minDate) return;
		onChange(next);
	};

	return (
		<View style={styles.wrapper}>
			{label && <Text style={styles.label}>{label}</Text>}
			<View style={styles.row}>
				<View style={[styles.pickerWrapper,{flex: 1.2},pickerStyle]}>
					<Picker
						selectedValue={year}
						onValueChange={(y) => updateDate(y)}
					>
						{years.map((y) => (
							<Picker.Item key={y} label={`${y}年`} value={y} />
						))}
					</Picker>
				</View>

				<View style={[styles.pickerWrapper,{flex: 1},pickerStyle]}>
					<Picker
						selectedValue={month}
						onValueChange={(m) => updateDate(undefined, m)}
					>
						{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
							<Picker.Item key={m} label={`${m}月`} value={m} />
						))}
					</Picker>
				</View>

				<View style={[styles.pickerWrapper,{flex: 1},pickerStyle]}>
					<Picker
						selectedValue={day}
						onValueChange={(d) => updateDate(undefined, undefined, d)}
					>
						{Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
							<Picker.Item key={d} label={`${d}日`} value={d} />
						))}
					</Picker>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
	},
	pickerWrapper: {
		width: wp(30),
		height: hp(6),
		margin: -1,
		justifyContent: 'center',
		alignContent: 'center'
	},
	label: {
		fontSize: 16,
		marginBottom: 5,
	},
	row: {
		flexDirection: "row",
		width: "100%",
	},
});
