import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import dayjs from 'dayjs';

export default function MonthView({ days, currentMonth, selectedDate, onSelectDate }: { days: Array<dayjs.Dayjs>, currentMonth: dayjs.Dayjs, selectedDate: dayjs.Dayjs | null, onSelectDate: (date: dayjs.Dayjs) => void }) {
	const { width } = Dimensions.get('window');
	const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
	return (
		<View style={{ height: 350 }}>
			{/* ✅ Weekday Header */}
			<View style={styles.weekRow}>
				{WEEKDAYS.map((day, index) => (
					<View key={index} style={styles.weekCell}>
						<Text style={styles.weekText}>{day}</Text>
					</View>
				))}
			</View>

			{/* ✅ Calendar Grid */}
			<View style={styles.container}>
				{days.map((day, index) => {
					const isCurrentMonth = day.month() === currentMonth.month();
					const isSelected = selectedDate?.isSame(day, 'day');
					const isToday = day.isSame(dayjs(), 'day');

					return (
						<TouchableOpacity
							key={index}
							style={styles.cell}
							onPress={() => onSelectDate(day)}
							activeOpacity={0.7}
						>
							<View
								style={[
									styles.inner,
									isSelected && styles.selected,
									isToday && !isSelected && styles.todayBorder,
								]}
							>
								<Text
									style={[
										styles.text,
										!isCurrentMonth && styles.inactiveText,
										isSelected && styles.selectedText,
									]}
								>
									{day.date()}
								</Text>
							</View>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	/* Week Header */
	weekRow: {
		flexDirection: 'row',
		marginBottom: 5,
	},
	weekCell: {
		width: '13.28%',
		alignItems: 'center',
	},
	weekText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#888',
	},

	/* Grid */
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	cell: {
		width: '13.28%',
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},

	/* Inner Day */
	inner: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
	},

	/* States */
	selected: {
		backgroundColor: '#6C5CE7',
	},
	selectedText: {
		color: '#fff',
		fontWeight: '600',
	},
	inactiveText: {
		opacity: 0.3,
	},
	todayBorder: {
		borderWidth: 1,
		borderColor: '#6C5CE7',
	},

	text: {
		fontSize: 15,
	},
});