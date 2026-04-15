import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CalendarHeader({ month, onPrev, onNext, onPressTitle }: { month: dayjs.Dayjs, onPrev: () => void, onNext: () => void, onPressTitle: () => void }) {
	return (
		<View style={styles.header}>
			<TouchableOpacity onPress={onPrev}>
				<Icon name="arrow-back" size={24} color="#000" />
			</TouchableOpacity>

			<TouchableOpacity onPress={onPressTitle}>
				<Text style={styles.title}>
					{month.format('MMMM YYYY')}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={onNext}>
				<Icon name="arrow-forward" size={24} color="#000" />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 30,
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
	},
	arrow: {
		fontSize: 20,
		paddingHorizontal: 10,
	},
});