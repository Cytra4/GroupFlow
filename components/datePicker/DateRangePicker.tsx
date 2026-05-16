import { BaseDialog, DialogRef } from '@/components/UI/BaseDialog';
import PressableEffect from '@/components/UI/PressableEffect';
import { addMonths, endOfMonth, format, getMonth, getYear, startOfMonth } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface DateRange {
	start: Date;
	end: Date;
}

interface DateRangePickerProps {
	range: DateRange;
	onChange: React.Dispatch<React.SetStateAction<DateRange>>;
}

const CURRENT_YEAR = getYear(new Date());
const YEAR_LIST = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function DateRangePicker({ range, onChange }: DateRangePickerProps) {
	const dialogRef = useRef<DialogRef>(null);
	const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');

	const rangeLabel = useMemo(() => {
		const startStr = format(range.start, 'yyyy年 M月', { locale: zhTW });
		const endStr = format(range.end, 'yyyy年 M月', { locale: zhTW });
		return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
	}, [range]);

	const activeDate = pickerMode === 'start' ? range.start : range.end;
	const selectedYear = getYear(activeDate);
	const selectedMonth = getMonth(activeDate) + 1;

	const shiftMonthRange = (months: number) => {
		onChange((prev) => ({
			start: startOfMonth(addMonths(prev.start, months)),
			end: endOfMonth(addMonths(prev.end, months)),
		}));
	};

	const handleOpenPicker = (mode: 'start' | 'end') => {
		setPickerMode(mode);
		dialogRef.current?.open(); 
	};

	const handleSelectMonth = (year: number, month: number) => {
		const clickedDate = new Date(year, month - 1, 1);

		onChange((prev) => {
			if (pickerMode === 'start') {
				const newStart = startOfMonth(clickedDate);
				return {
					start: newStart,
					end: newStart > prev.end ? endOfMonth(newStart) : prev.end
				};
			} else {
				const newEnd = endOfMonth(clickedDate);
				return {
					start: newEnd < prev.start ? startOfMonth(newEnd) : prev.start,
					end: newEnd
				};
			}
		});
		dialogRef.current?.close();
	};

	return (
		<View style={styles.rangeSelector}>
			<PressableEffect 
				style={styles.arrowButton} 
				onPress={() => shiftMonthRange(-1)}
				activeColor="#FFF0E6"
			>
				<Text style={styles.arrowText}>◀</Text>
			</PressableEffect>

			<View style={styles.displayArea}>
				<PressableEffect 
					style={styles.dateChip} 
					onPress={() => handleOpenPicker('start')}
					initialColor="#FFF0E6"
					activeColor="#ffcdab"
				>
					<Text style={styles.chipText}>起</Text>
				</PressableEffect>

				<Text style={styles.mainLabel}>{rangeLabel}</Text>

				<PressableEffect 
					style={styles.dateChip} 
					onPress={() => handleOpenPicker('end')}
					initialColor="#FFF0E6"
					activeColor="#ffcdab"
				>
					<Text style={styles.chipText}>迄</Text>
				</PressableEffect>
			</View>

			<PressableEffect 
				style={styles.arrowButton} 
				onPress={() => shiftMonthRange(1)}
				activeColor='#FFF0E6'
			>
				<Text style={styles.arrowText}>▶</Text>
			</PressableEffect>

			<BaseDialog
				ref={dialogRef}
				containerStyle={styles.customDialogContainer}
			>
				<View style={styles.pickerHeader}>
					<Text style={styles.pickerTitle}>
						{pickerMode === 'start' ? '設定開始月份' : '設定結束月份'}
					</Text>
					<PressableEffect 
						style={styles.closeButton} 
						onPress={() => dialogRef.current?.close()}
						activeColor="#f1f3f5"
					>
						<Text style={styles.closeText}>關閉</Text>
					</PressableEffect>
				</View>

				<ScrollView
					style={styles.formScroll}
					contentContainerStyle={styles.formScrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{YEAR_LIST.map((year) => {
						const isTargetYear = year === selectedYear;

						return (
							<View key={year} style={styles.yearSection}>
								<Text style={[styles.yearTitle, isTargetYear && styles.activeYearTitle]}>
									{year} 年
								</Text>

								<View style={styles.monthGrid}>
									{MONTHS.map((month) => {
										const isSelected = isTargetYear && month === selectedMonth;

										return (
											<PressableEffect
												key={month}
												style={[styles.monthChip, isSelected && styles.selectedMonthChip]}
												onPress={() => handleSelectMonth(year, month)}
												initialColor={isSelected ? 'coral' : '#f8f9fa'}
												activeColor={isSelected ? '#E6673A' : '#e9ecef'}
											>
												<Text style={[styles.monthText, isSelected && styles.selectedMonthText]}>
													{month}月
												</Text>
											</PressableEffect>
										);
									})}
								</View>
							</View>
						);
					})}
				</ScrollView>
			</BaseDialog>
		</View>
	);
}

const styles = StyleSheet.create({
	rangeSelector: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		backgroundColor: '#fff', 
		borderRadius: 14, 
		marginVertical: 10,
		borderWidth: 1,
		borderColor: '#e9ecef',
		overflow: 'hidden' 
	},
	arrowButton: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8 },
	arrowText: { fontSize: 15, color: 'coral', fontWeight: 'bold' }, // 🎯 直接指定字串 coral
	displayArea: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
	mainLabel: { fontSize: 14, fontWeight: '700', color: '#212529', textAlign: 'center', minWidth: 120 },
	
	dateChip: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
	chipText: { fontSize: 12, color: 'coral', fontWeight: 'bold' }, // 🎯 直接指定字串 coral
	
	customDialogContainer: {
		width: '90%',
		height: '60%', 
		borderRadius: 20,
		padding: 0, 
		overflow: 'hidden',
	},
	pickerHeader: { 
		flexDirection: 'row', 
		justifyContent: 'space-between', 
		alignItems: 'center', 
		paddingLeft: 18, 
		paddingRight: 8, 
		paddingVertical: 12,
		borderBottomWidth: 1, 
		borderColor: '#f1f3f5',
		backgroundColor: '#fff'
	},
	pickerTitle: { fontSize: 16, fontWeight: '700', color: '#212529' },
	closeButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
	closeText: { fontSize: 15, fontWeight: '600', color: '#868e96' },
	
	formScroll: { flex: 1, backgroundColor: '#fff' },
	formScrollContent: { paddingVertical: 16, paddingHorizontal: 16 },
	yearSection: { marginBottom: 20 },
	yearTitle: { fontSize: 16, fontWeight: '800', color: '#495057', marginBottom: 10 },
	activeYearTitle: { color: 'coral' }, 
	monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
	
	monthChip: {
		width: '23%', 
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#e9ecef',
	},
	selectedMonthChip: {
		borderColor: 'coral',
	},
	monthText: { fontSize: 13, fontWeight: '600', color: '#495057' },
	selectedMonthText: { color: '#fff', fontWeight: '700' },
});
