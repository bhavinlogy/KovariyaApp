import React,{useState} from 'react';
import {View,Dimensions,StyleSheet,Text} from 'react-native';
import dayjs from 'dayjs';
import Animated,{
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	runOnJS,
} from 'react-native-reanimated';
import {Gesture,GestureDetector} from 'react-native-gesture-handler';

import MonthView from './MonthView';
import {useCalendar} from '../../hooks/useCalendar';
import CalendarHeader from './CalendarHeader';

const {width}=Dimensions.get('window');

export default function Calendar({onSelectDate}: {onSelectDate: (date: dayjs.Dayjs) => void}) {
	const [month,setMonth]=useState(dayjs());
	const [selectedDate,setSelectedDate]=useState(null);

	const translateX=useSharedValue(0);
	const opacity=useSharedValue(1);

	const days=useCalendar(month);

	const changeMonth=(direction: string) => {
		const toValue=direction==='next'? -width:width;

		translateX.value=withTiming(toValue,{duration: 250});
		opacity.value=withTiming(0,{duration: 200},() => {
			runOnJS(updateMonth)(direction);

			translateX.value=direction==='next'? width:-width;

			translateX.value=withTiming(0,{duration: 250});
			opacity.value=withTiming(1,{duration: 200});
		});
	};

	const updateMonth=(direction: string) => {
		setMonth((prev) =>
			direction==='next'
				? prev.add(1,'month')
				:prev.subtract(1,'month')
		);
	};

	const panGesture=Gesture.Pan()
		.onUpdate((e) => {
			// optional debug
			//console.log("checking...",e.translationX);
			translateX.value=e.translationX;
		})
		.onEnd((e) => {
			//if(e.translationX<-50) {
			//	runOnJS(changeMonth)('next');
			//} else if(e.translationX>50) {
			//	runOnJS(changeMonth)('prev');
			//}
			if(e.translationX<-width/3) {
				runOnJS(changeMonth)('next');
			} else if(e.translationX>width/3) {
				runOnJS(changeMonth)('prev');
			} else {
				// snap back
				translateX.value=withTiming(0,{duration: 200});
			}
		});

	const animatedStyle=useAnimatedStyle(() => ({
		transform: [{translateX: translateX.value}],
		opacity: opacity.value,
	}));

	const handleSelect=(day: any) => {
		console.log("selected");
		setSelectedDate(day);
		onSelectDate?.(day);
	};

	return (
		<View style={{height: 400}}>
			<CalendarHeader
				month={month}
				onPrev={() => changeMonth('prev')}
				onNext={() => changeMonth('next')}
			/>
			<GestureDetector gesture={panGesture}>
				<Animated.View style={[{width},animatedStyle]}>
					<MonthView
						days={days}
						currentMonth={month}
						selectedDate={selectedDate}
						onSelectDate={handleSelect}
					/>
				</Animated.View>
			</GestureDetector>
		</View>
	);
}