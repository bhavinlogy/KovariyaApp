import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	Modal,
	View,
	StyleSheet,
	Pressable,
	Text,
	Dimensions,
} from 'react-native';
import dayjs from 'dayjs';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	Easing,
	runOnJS,
	interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker, {
	useDefaultStyles,
	type DateType,
} from 'react-native-ui-datepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import {
	colors,
	spacing,
	borderRadius,
	shadows,
	textStyles,
	typography,
} from '../../theme';

const { width: SW } = Dimensions.get('window');

/* ─── swipe thresholds ─── */
const SWIPE_DISTANCE_THRESHOLD = SW * 0.18;
const SWIPE_VELOCITY_THRESHOLD = 500;

/* ─── modal animation configs ─── */
const ANIM_IN = { duration: 250, easing: Easing.out(Easing.back(1.15)) };
const ANIM_OUT = { duration: 200, easing: Easing.in(Easing.quad) };

/* ─── types ─── */
interface CalendarModalProps {
	visible: boolean;
	onClose: () => void;
	onSelectDate: (date: dayjs.Dayjs) => void;
	initialDate?: Date;
	minDate?: Date;
	maxDate?: Date;
	title?: string;
}

export default function CalendarModal({
	visible,
	onClose,
	onSelectDate,
	initialDate,
	minDate = new Date(1900, 0, 1),
	maxDate = new Date(),
	title = 'Select Date',
}: CalendarModalProps) {
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedDate, setSelectedDate] = useState<DateType>(
		initialDate ?? dayjs().toDate(),
	);

	/**
	 * viewAnchor is a dayjs representing the month currently displayed.
	 * It is the single source of truth for which month/year the picker shows.
	 * We use `key` to remount the DateTimePicker when it changes via swipe,
	 * which is the most reliable way to externally navigate the library's
	 * uncontrolled internal state.
	 *
	 * The library's own header arrows still work normally within one "mount".
	 * The anchor is only advanced on swipe.
	 */
	const [viewAnchor, setViewAnchor] = useState(() =>
		dayjs(initialDate ?? undefined).startOf('month'),
	);

	/** Monotonically increasing counter to always create a fresh key */
	const [mountKey, setMountKey] = useState(0);

	const progress = useSharedValue(0);

	/* ─── ref for fresh closure in worklet callbacks ─── */
	const viewRef = useRef(viewAnchor);
	viewRef.current = viewAnchor;

	/* ─── open / sync initial date ─── */
	useEffect(() => {
		if (visible) {
			const d = dayjs(initialDate ?? undefined);
			if (initialDate) setSelectedDate(initialDate);
			setViewAnchor(d.startOf('month'));
			setMountKey((k) => k + 1);
			setModalVisible(true);
			requestAnimationFrame(() => {
				progress.value = withTiming(1, ANIM_IN);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible]);

	/* ─── close helpers ─── */
	const animateClose = useCallback(
		(cb?: () => void) => {
			progress.value = withTiming(0, ANIM_OUT, () => {
				runOnJS(setModalVisible)(false);
				runOnJS(onClose)();
				if (cb) runOnJS(cb)();
			});
		},
		[onClose, progress],
	);

	const handleClose = useCallback(() => animateClose(), [animateClose]);

	const handleConfirm = useCallback(() => {
		if (selectedDate) {
			onSelectDate(dayjs(selectedDate as string | number | Date));
		}
		animateClose();
	}, [selectedDate, onSelectDate, animateClose]);

	/* ─── swipe gesture → change month ─── */
	const changeMonthBy = useCallback((delta: number) => {
		setViewAnchor((prev) => prev.add(delta, 'month'));
		setMountKey((k) => k + 1);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	}, []);

	const swipeX = useSharedValue(0);
	const isSwipeActive = useSharedValue(false);
	const translateX = useSharedValue(-SW);

	const panGesture = Gesture.Pan()
		.activeOffsetX([-15, 15]) // don't steal vertical scrolls or day-taps
		.failOffsetY([-10, 10])
		.onStart(() => {
			isSwipeActive.value = true;
		})
		.onUpdate((e) => {
			console.log('eee', e.translationX)
			swipeX.value = e.translationX;
		})
		.onEnd((e) => {

			if (e.translationX < -SW / 3 || e.velocityX < -800) {
				runOnJS(changeMonthBy)(1);

				translateX.value = withTiming(-2 * SW, {}, () => {
					translateX.value = -SW;
				});

			} else if (e.translationX > SW / 3 || e.velocityX > 800) {
				runOnJS(changeMonthBy)(-1);

				translateX.value = withTiming(0, {}, () => {
					translateX.value = -SW;
				});

			}

			const significantSwipe =
				Math.abs(e.translationX) > SWIPE_DISTANCE_THRESHOLD ||
				Math.abs(e.velocityX) > SWIPE_VELOCITY_THRESHOLD;

			if (significantSwipe) {
				// swipe left → next month (+1), swipe right → prev month (-1)
				const direction = e.translationX < 0 ? 1 : -1;
				runOnJS(changeMonthBy)(direction);
			}

			swipeX.value = withSpring(0, {
				damping: 20,
				stiffness: 300,
			});
			isSwipeActive.value = false;
		});

	/** Subtle drag-hint while swiping — caps at ±30px */
	const swipeAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: interpolate(
					swipeX.value,
					[-SW, 0, SW],
					[-30, 0, 30],
				),
			},
		],
		opacity: interpolate(
			Math.abs(swipeX.value),
			[0, SW * 0.35],
			[1, 0.65],
		),
	}));

	/* ─── modal zoom animation ─── */
	const overlayStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
	}));

	const cardStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0.6, 1]),
		transform: [
			{ scale: interpolate(progress.value, [0, 1], [0.82, 1]) },
		],
	}));

	/* ─── design-system–mapped datepicker styles ─── */
	const defaultStyles = useDefaultStyles('light');
	const pickerStyles = {
		...defaultStyles,

		/* header */
		header: { marginBottom: spacing.sm },
		month_selector_label: {
			fontSize: typography.fontSize.lg,
			fontWeight: typography.fontWeight.semibold,
			color: colors.textPrimary,
			fontFamily: typography.fontFamily.primary,
		},
		year_selector_label: {
			fontSize: typography.fontSize.lg,
			fontWeight: typography.fontWeight.semibold,
			color: colors.textPrimary,
			fontFamily: typography.fontFamily.primary,
		},

		/* weekdays */
		weekday_label: {
			fontSize: typography.fontSize.xs,
			fontWeight: typography.fontWeight.semibold,
			color: colors.textMuted,
			textTransform: 'uppercase' as const,
		},

		/* day cells */
		day: { borderRadius: 9999 },
		day_cell: { padding: 2 },
		day_label: {
			fontSize: typography.fontSize.sm,
			fontWeight: typography.fontWeight.regular,
			color: colors.textPrimary,
			fontFamily: typography.fontFamily.primary,
		},

		/* selected */
		selected: { backgroundColor: colors.primary, borderRadius: 9999 },
		selected_label: {
			color: colors.surface,
			fontWeight: typography.fontWeight.semibold,
		},

		/* today */
		today: {
			borderWidth: 1.5,
			borderColor: colors.primary,
			borderRadius: 9999,
			backgroundColor: 'transparent',
		},
		today_label: {
			color: colors.primary,
			fontWeight: typography.fontWeight.semibold,
		},

		/* outside days */
		outside: {},
		outside_label: { color: colors.textMuted, opacity: 0.4 },

		/* disabled */
		disabled: {},
		disabled_label: { color: colors.textMuted, opacity: 0.3 },

		/* month picker grid */
		month: {
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: borderRadius.small,
		},
		month_label: {
			color: colors.textPrimary,
			fontFamily: typography.fontFamily.primary,
			fontSize: typography.fontSize.sm,
		},
		selected_month: {
			backgroundColor: colors.primary,
			borderColor: colors.primary,
			borderRadius: borderRadius.small,
		},
		selected_month_label: {
			color: colors.surface,
			fontWeight: typography.fontWeight.semibold,
		},

		/* year picker grid */
		year: {
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: borderRadius.small,
		},
		year_label: {
			color: colors.textPrimary,
			fontFamily: typography.fontFamily.primary,
			fontSize: typography.fontSize.sm,
		},
		selected_year: {
			backgroundColor: colors.primary,
			borderColor: colors.primary,
			borderRadius: borderRadius.small,
		},
		selected_year_label: {
			color: colors.surface,
			fontWeight: typography.fontWeight.semibold,
		},
		active_year: {
			backgroundColor: colors.lavenderSoft,
			borderColor: colors.lavender,
			borderRadius: borderRadius.small,
		},
		active_year_label: {
			color: colors.primary,
			fontWeight: typography.fontWeight.semibold,
		},

		/* nav arrows — tint to brand primary */
		button_next_image: { tintColor: colors.primary },
		button_prev_image: { tintColor: colors.primary },
	};

	return (
		<Modal
			visible={modalVisible}
			transparent
			animationType="none"
			statusBarTranslucent
			onRequestClose={handleClose}
		>
			<GestureHandlerRootView style={{ flex: 1 }}>

				<View style={styles.wrapper}>
					{/* ── overlay with fade ── */}
					<Animated.View style={[styles.overlay, overlayStyle]}>
						<Pressable
							style={StyleSheet.absoluteFill}
							onPress={handleClose}
						/>
					</Animated.View>

					{/* ── zooming card ── */}
					<Animated.View style={[styles.card, cardStyle]}>
						{/* title row */}
						<View style={styles.titleRow}>
							<Text style={styles.title}>{title}</Text>
							<Pressable
								onPress={handleClose}
								hitSlop={12}
								style={styles.closeBtn}
							>
								<Icon
									name="close"
									size={20}
									color={colors.textSecondary}
								/>
							</Pressable>
						</View>


						{/* swipeable date picker */}
						<GestureDetector gesture={panGesture}>
							<Animated.View>
								<DateTimePicker
									key={`dp-${mountKey}`}
									mode="single"
									date={selectedDate}
									onChange={({ date }) => setSelectedDate(date)}
									minDate={minDate}
									maxDate={maxDate}
									styles={pickerStyles}
									showOutsideDays
									firstDayOfWeek={0}
									containerHeight={320}
									month={viewAnchor.month()}
									year={viewAnchor.year()}
								/>
							</Animated.View>
						</GestureDetector>
						{/* action buttons */}
						<View style={styles.actions}>
							<Pressable
								style={({ pressed }) => [
									styles.cancelBtn,
									pressed && styles.btnPressed,
								]}
								onPress={handleClose}
							>
								<Text style={styles.cancelText}>Cancel</Text>
							</Pressable>

							<Pressable
								style={({ pressed }) => [
									styles.confirmBtn,
									pressed && styles.btnPressed,
								]}
								onPress={handleConfirm}
							>
								<Text style={styles.confirmText}>Confirm</Text>
							</Pressable>
						</View>
					</Animated.View>
				</View>
			</GestureHandlerRootView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},

	/* dark scrim */
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: colors.inkOverlay,
	},

	/* floating card */
	card: {
		width: SW - spacing.lg * 2,
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
		...shadows.large,
	},

	/* header */
	titleRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: spacing.md,
	},
	title: {
		...textStyles.headingMedium,
		color: colors.textPrimary,
	},
	closeBtn: {
		padding: spacing.xs,
		borderRadius: borderRadius.full,
		backgroundColor: colors.surfaceMuted,
	},

	/* footer actions */
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: spacing.sm,
		marginTop: spacing.md,
		paddingTop: spacing.md,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	cancelBtn: {
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm + 2,
		borderRadius: borderRadius.small,
		borderWidth: 1
	},
	confirmBtn: {
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm + 2,
		borderRadius: borderRadius.small,
		backgroundColor: colors.primary,
		...shadows.small,
	},
	btnPressed: { opacity: 0.8 },
	cancelText: {
		...textStyles.button,
		fontSize: typography.fontSize.sm,
		color: colors.textSecondary,
	},
	confirmText: {
		...textStyles.button,
		fontSize: typography.fontSize.sm,
		color: colors.surface,
	},
});