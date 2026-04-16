/**
 * Shared gauge (SemiCircle / RoundGauge) and AnimatedNumber primitives.
 * Used by BSIGaugeCard, SupportGauges, and AspectScoreGrid.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
	useAnimatedProps,
	useSharedValue,
	withTiming,
	withDelay,
	Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/* ═══════════════════════════════════════════════════════════════════ */
/*  AnimatedNumber                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
export function AnimatedNumber({
	value,
	delay = 0,
	duration = 1200,
	style,
	prefix = '',
	suffix = '%',
}: {
	value: number;
	delay?: number;
	duration?: number;
	style?: any;
	prefix?: string;
	suffix?: string;
}) {
	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = 0;
		progress.value = withDelay(
			delay,
			withTiming(value, { duration, easing: Easing.out(Easing.cubic) })
		);
	}, [value, delay, duration, progress]);

	const animProps = useAnimatedProps(() => {
		return {
			text: `${prefix}${Math.round(progress.value)}${suffix}`,
		} as any;
	});

	return (
		<AnimatedTextInput
			editable={false}
			animatedProps={animProps}
			defaultValue={`${prefix}0${suffix}`}
			style={[style, { padding: 0, margin: 0 }]}
		/>
	);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Semi-circle Gauge (BSI hero + KPI gauges)                         */
/* ═══════════════════════════════════════════════════════════════════ */
export function SemiCircleGauge({
	percent,
	size = 160,
	strokeWidth = 14,
	fillColor,
	trackColor = 'rgba(0,0,0,0.06)',
	delay = 200,
}: {
	percent: number;
	size?: number;
	strokeWidth?: number;
	fillColor: string;
	trackColor?: string;
	delay?: number;
}) {
	const radius = (size - strokeWidth) / 2;
	const halfCircumference = Math.PI * radius;
	const clamped = Math.min(100, Math.max(0, percent));

	const animProgress = useSharedValue(0);

	useEffect(() => {
		animProgress.value = 0;
		animProgress.value = withDelay(
			delay,
			withTiming(clamped, { duration: 1200, easing: Easing.out(Easing.cubic) })
		);
	}, [clamped, delay, animProgress]);

	const animProps = useAnimatedProps(() => {
		const offset = halfCircumference - (animProgress.value / 100) * halfCircumference;
		return { strokeDashoffset: offset };
	});

	return (
		<View style={{ alignItems: 'center', justifyContent: 'center' }}>
			<Svg width={size} height={size / 2 + strokeWidth / 2}>
				{/* Track */}
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={trackColor}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					strokeDasharray={`${halfCircumference} ${halfCircumference * 2}`}
					transform={`rotate(180 ${size / 2} ${size / 2})`}
				/>
				{/* Animated fill */}
				<AnimatedCircle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={fillColor}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					strokeDasharray={`${halfCircumference} ${halfCircumference * 2}`}
					transform={`rotate(180 ${size / 2} ${size / 2})`}
					animatedProps={animProps}
				/>
			</Svg>
		</View>
	);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Round Gauge (full circle for Aspect Scores)                       */
/* ═══════════════════════════════════════════════════════════════════ */
export function RoundGauge({
	percent,
	size = 72,
	strokeWidth = 7,
	fillColor,
	trackColor = 'rgba(0,0,0,0.06)',
	delay = 0,
}: {
	percent: number;
	size?: number;
	strokeWidth?: number;
	fillColor: string;
	trackColor?: string;
	delay?: number;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const clamped = Math.min(100, Math.max(0, percent));

	const animProgress = useSharedValue(0);

	useEffect(() => {
		animProgress.value = 0;
		animProgress.value = withDelay(
			delay,
			withTiming(clamped, { duration: 1100, easing: Easing.out(Easing.cubic) })
		);
	}, [clamped, delay, animProgress]);

	const animProps = useAnimatedProps(() => {
		const offset = circumference - (animProgress.value / 100) * circumference;
		return { strokeDashoffset: offset };
	});

	return (
		<View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
			<Svg width={size} height={size}>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={trackColor}
					strokeWidth={strokeWidth}
					fill="transparent"
				/>
				<AnimatedCircle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={fillColor}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					strokeDasharray={`${circumference}`}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
					animatedProps={animProps}
				/>
			</Svg>
			<View style={StyleSheet.absoluteFillObject}>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<AnimatedNumber
						value={clamped}
						suffix="%"
						delay={delay}
						duration={1100}
						style={{
							fontSize: size > 70 ? 16 : 14,
							fontWeight: '800',
							color: fillColor,
							textAlign: 'center',
							letterSpacing: -0.3,
						}}
					/>
				</View>
			</View>
		</View>
	);
}
