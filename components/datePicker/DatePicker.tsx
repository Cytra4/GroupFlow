import { hp, wp } from "@/scripts/constants";
import { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';

type Props = {
	label?: string;
	value: Date;
	onChange: (date: Date) => void;
	minDate?: Date;
	pickerStyle?: object;
};

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 10,
		paddingHorizontal: 12,
		color: 'black',
		textAlign: 'center',
	},
	inputIOSContainer: {
		zIndex: 100,
	},
	inputAndroid: {
		fontSize: 16,
		paddingVertical: 8,
		paddingHorizontal: 12,
		color: 'black',
		textAlign: 'center',
	},
	pickerContainer: {
		zIndex: 100,
	},
});

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

	const monthItems = useMemo(() => {
		return Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }));
	}, []);

	const dayItems = useMemo(() => {
		return Array.from({ length: daysInMonth }, (_, i) => ({ label: `${i + 1}日`, value: i + 1 }));
	}, [daysInMonth]);

	const yearItems = useMemo(() => {
		return years.map((y) => ({ label: `${y}年`, value: y }));
	}, [years]);

	const updateDate = useCallback((y = year, m = month, d = day) => {
		const next = new Date(y, m - 1, d);
		if (minDate && next < minDate) return;
		onChange(next);
	}, [year, month, day, minDate, onChange]);

	return (
		<View style={styles.wrapper}>
			{label && <Text style={styles.label}>{label}</Text>}
			<View style={styles.row}>
				<View style={[styles.pickerWrapper, { flex: 1.2 }, pickerStyle]}>
					<RNPickerSelect
						value={year}
						onValueChange={(y) => updateDate(y)}
						placeholder={{}}
						items={yearItems}
						style={pickerSelectStyles}
						useNativeAndroidPickerStyle={false}
						pickerProps={{
							itemStyle: {
								color: 'black'
							}
						}}
						doneText="完成"
					/>
				</View>
				<View style={[styles.pickerWrapper, { flex: 1 }, pickerStyle]}>
					<RNPickerSelect
						value={month}
						onValueChange={(m) => updateDate(undefined, m)}
						placeholder={{}}
						items={monthItems}
						style={pickerSelectStyles}
						useNativeAndroidPickerStyle={false}
						pickerProps={{
							itemStyle: {
								color: 'black'
							}
						}}
						doneText="完成"
					/>
				</View>
				<View style={[styles.pickerWrapper, { flex: 1 }, pickerStyle]}>
					<RNPickerSelect
						value={day}
						onValueChange={(d) => updateDate(undefined, undefined, d)}
						placeholder={{}}
						items={dayItems}
						style={pickerSelectStyles}
						useNativeAndroidPickerStyle={false}
						pickerProps={{
							itemStyle: {
								color: 'black'
							}
						}}
						doneText="完成"
					/>
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
		minHeight: 50,
		margin: -1,
		justifyContent: 'center',
		alignContent: 'center',
		zIndex: 100,
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