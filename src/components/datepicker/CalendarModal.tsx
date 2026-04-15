import React,{useState} from 'react';
import {Modal,View,StyleSheet,TouchableOpacity,Text} from 'react-native';
import dayjs from 'dayjs';
import Calendar from './Calender'; // your calendar component
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export default function CalendarModal({
	visible,
	onClose,
	onSelectDate,
}: {
	visible: boolean;
	onClose: () => void;
	onSelectDate: (date: dayjs.Dayjs) => void;
}) {
	const [selectedDate,setSelectedDate]=useState<dayjs.Dayjs|null>(null);

	const handleConfirm=() => {
		if(selectedDate) {
			onSelectDate(selectedDate);
		}
		onClose();
	};

	return (
		<Modal visible={visible} transparent animationType="fade">
			<GestureHandlerRootView style={{flex: 1}}>
				<View style={styles.overlay}>

					<View style={styles.container}>

						{/* Header */}
						<Text style={styles.title}>Select Date</Text>

						{/* Calendar */}
						<Calendar onSelectDate={setSelectedDate} />

						{/* Actions */}
						<View style={styles.actions}>
							<TouchableOpacity onPress={onClose}>
								<Text>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity onPress={handleConfirm}>
								<Text style={{fontWeight: 'bold'}}>OK</Text>
							</TouchableOpacity>
						</View>

					</View>
				</View>
			</GestureHandlerRootView>
		</Modal>
	);
}

const styles=StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
	},
	container: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 16,
		height: 500
	},
	title: {
		fontSize: 18,
		marginBottom: 10,
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 10,
		gap: 20,
	},
});