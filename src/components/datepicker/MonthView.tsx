import React from 'react';
import {View,Text,StyleSheet,TouchableOpacity,Dimensions} from 'react-native';
import dayjs from 'dayjs';

export default function MonthView({days,currentMonth,selectedDate,onSelectDate}: {days: Array<dayjs.Dayjs>,currentMonth: dayjs.Dayjs,selectedDate: dayjs.Dayjs|null,onSelectDate: (date: dayjs.Dayjs) => void}) {
	const {width}=Dimensions.get('window');
	const WEEKDAYS=['S','M','T','W','T','F','S'];
	return (
		<View style={[styles.container,{width: width-75}]}>
			{WEEKDAYS.map((day,index) => (
				<View key={index} style={styles.cell}>
					<Text style={styles.weekText}>{day}</Text>
				</View>
			))}
			{days.map((day,index) => {
				const isCurrentMonth=day.month()===currentMonth.month();
				const isSelected=selectedDate?.isSame(day,'day');
				const isToday=day.isSame(dayjs(),'day');

				return (
					<TouchableOpacity
						key={index}
						style={styles.cell}
						onPress={() => onSelectDate(day)}
					>
						<View
							style={[
								styles.inner,
								isSelected&&styles.selected,
							]}
						>
							<Text
								style={[
									styles.text,
									!isCurrentMonth&&{opacity: 0.3},
									isSelected&&{color: '#fff'},
									isToday&&{fontWeight: 'bold'},
								]}
							>
								{day.date()}
							</Text>
						</View>
					</TouchableOpacity>
				);
			})}
		</View>
	);
}

const styles=StyleSheet.create({
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		width: 'auto'
	},
	cell: {
		width: '14.28%',
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	inner: {
		padding: 8,
		borderRadius: 20,
	},
	selected: {
		backgroundColor: '#6C5CE7',
		borderRadius: 10
	},
	text: {
		fontSize: 16,
	},
	weekText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#888',
	}
});