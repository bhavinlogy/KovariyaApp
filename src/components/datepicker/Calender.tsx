import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import dayjs from 'dayjs';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import MonthView from './MonthView';
import { useCalendar } from '../../hooks/useCalendar';
import CalendarHeader from './CalendarHeader';
import YearPicker from './YearPicker';

const { width } = Dimensions.get('window');

export default function Calendar({ onSelectDate }: { onSelectDate: (date: dayjs.Dayjs) => void }) {
	const [month, setMonth] = useState(dayjs());
	const [selectedDate, setSelectedDate] = useState(dayjs()); // ✅ default today
	const [showYearPicker, setShowYearPicker] = useState(false);

	const prevMonth = month.subtract(1, 'month');
	const nextMonth = month.add(1, 'month');

	const prevDays = useCalendar(prevMonth);
	const currentDays = useCalendar(month);
	const nextDays = useCalendar(nextMonth);

	const translateX = useSharedValue(-width);

	const isAnimating = useSharedValue(false);

	useEffect(() => {
		translateX.value = -width;
	}, [month]);

	const updateMonth = (direction: string) => {
		setMonth((prev) =>
			direction === 'next'
				? prev.add(1, 'month')
				: prev.subtract(1, 'month')
		);
	};

	// ✅ Velocity + distance based swipe
	const panGesture = Gesture.Pan()
		.onUpdate((e) => {
			translateX.value = -width + e.translationX;
		})
		.onEnd((e) => {
			if (isAnimating.value) return;

			isAnimating.value = true;

			if (e.translationX < -width / 3 || e.velocityX < -800) {
				runOnJS(updateMonth)('next');

				translateX.value = withTiming(-2 * width, {}, () => {
					translateX.value = -width;
					isAnimating.value = false;
				});

			} else if (e.translationX > width / 3 || e.velocityX > 800) {
				runOnJS(updateMonth)('prev');

				translateX.value = withTiming(0, {}, () => {
					translateX.value = -width;
					isAnimating.value = false;
				});

			} else {
				translateX.value = withTiming(-width, {}, () => {
					isAnimating.value = false;
				});
			}
		});

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const handleSelect = (day: dayjs.Dayjs) => {
		setSelectedDate(day);
		onSelectDate?.(day);
	};

	const handlePrev = () => {
		translateX.value = withTiming(0, {}, () => {
			runOnJS(updateMonth)('prev');
			translateX.value = -width;
		});
	};

	const handleNext = () => {
		translateX.value = withTiming(-2 * width, {}, () => {
			runOnJS(updateMonth)('next');
			translateX.value = -width;
		});
	};

	// ✅ Year selection handler
	const handleYearSelect = (year: number) => {
		setMonth(month.year(year));
		setShowYearPicker(false);
	};

	return (
		<View>
			<CalendarHeader
				month={month}
				onPrev={handlePrev}
				onNext={handleNext}
				onPressTitle={() => setShowYearPicker(true)} // 👈 tap to open
			/>

			{/* ✅ Year Picker */}
			{showYearPicker ? (
				<YearPicker
					currentYear={month.year()}
					onSelectYear={handleYearSelect}
				/>
			) : (
				<GestureDetector gesture={panGesture}>
					<Animated.View
						style={[
							{ flexDirection: 'row', width: width * 3 },
							animatedStyle,
						]}
					>
						<View style={{ width }}>
							<MonthView
								days={prevDays}
								currentMonth={prevMonth}
								selectedDate={selectedDate}
								onSelectDate={handleSelect}
							/>
						</View>

						<View style={{ width }}>
							<MonthView
								days={currentDays}
								currentMonth={month}
								selectedDate={selectedDate}
								onSelectDate={handleSelect}
							/>
						</View>

						<View style={{ width: width + 40 }}>
							<MonthView
								days={nextDays}
								currentMonth={nextMonth}
								selectedDate={selectedDate}
								onSelectDate={handleSelect}
							/>
						</View>
					</Animated.View>
				</GestureDetector>
			)}
		</View>
	);
}