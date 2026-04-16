import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Pressable,
	Platform,
	StatusBar as RNStatusBar,
	useWindowDimensions,
	TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { setStatusBarStyle } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Circle, Polyline, Line, Text as SvgText, Path } from 'react-native-svg';
import Animated, {
	FadeInDown,
	FadeIn,
	useAnimatedStyle,
	useAnimatedProps,
	useSharedValue,
	withTiming,
	withDelay,
	withSpring,
	Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/* ═══════════════════════════════════════════════════════════════════ */
/*  COLOUR RULES HELPER                                              */
/* ═══════════════════════════════════════════════════════════════════ */
function scoreColor(pct: number): string {
	if (pct >= 85) return '#2E8B57'; // Dark Green — Excellent
	if (pct >= 70) return '#5CB85C'; // Light Green — Consistent
	if (pct >= 50) return '#E8A04A'; // Amber — Average
	return '#E85D5D'; // Red — Needs Effort
}

function scoreBg(pct: number): string {
	if (pct >= 85) return 'rgba(46, 139, 87, 0.10)';
	if (pct >= 70) return 'rgba(92, 184, 92, 0.10)';
	if (pct >= 50) return 'rgba(232, 160, 74, 0.10)';
	return 'rgba(232, 93, 93, 0.10)';
}

function scoreLabel(pct: number): string {
	if (pct >= 85) return 'Excellent';
	if (pct >= 70) return 'Consistent';
	if (pct >= 50) return 'Average';
	return 'Needs Effort';
}

function heatmapColor(score: number | null): string {
	if (score === null) return 'rgba(0,0,0,0.04)'; // neutral empty
	if (score >= 85) return '#2E8B57';
	if (score >= 70) return '#7BCF7B';
	if (score >= 50) return '#F5C142';
	return '#E87070';
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  ANIMATED NUMBER                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
function AnimatedNumber({
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

import { AppGradientHeader, Card, ProgressCircle } from '../components';
import {
	colors,
	spacing,
	textStyles,
	borderRadius,
	getFloatingTabBarBottomPadding,
} from '../theme';
import { useChildren } from '../context/ChildrenContext';
import {
	getSdsAnalytics,
	getFamilyScore,
	getTrustMeter,
	getParentConsistency,
	getAspectScores,
	getWeeklyGraph,
	getMonthlyGraph,
	getDualTrendData,
	getDailyBehaviourScores,
	getSummaryCounters,
	getGuidance,
	getBadges,
	getStrengthsWeaknesses,
	type SdsAnalytics,
	type FamilyScoreData,
	type TrustMeterData,
	type ParentConsistencyData,
	type AspectScoreRow,
	type WeeklyGraphRow,
	type MonthlyGraphRow,
	type DualTrendRow,
	type DailyBehaviourScore,
	type SummaryCounters,
	type GuidanceItem,
	type BadgeItem,
} from '../data/analyticsData';
import { DASHBOARD_RATING_ASPECTS } from '../data/aspectRating';

/* ═══════════════════════════════════════════════════════════════════ */
/*  SEMI-CIRCLE GAUGE (for BSI hero + KPI gauges)                    */
/* ═══════════════════════════════════════════════════════════════════ */
function SemiCircleGauge({
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
/*  ROUND GAUGE (full circle for aspect scores)                      */
/* ═══════════════════════════════════════════════════════════════════ */
function RoundGauge({
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

/* ═══════════════════════════════════════════════════════════════════ */
/*  DUAL LINE CHART (BSI + Parent Consistency)                       */
/* ═══════════════════════════════════════════════════════════════════ */
const LINE_PAD = { l: 36, r: 14, t: 10, b: 24 };
const LINE_PLOT_H = 120;
const LINE_Y_TICKS = [100, 75, 50, 25];

function DualLineChart({ data }: { data: DualTrendRow[] }) {
	const { width: windowWidth } = useWindowDimensions();
	const chartW = Math.max(220, windowWidth - spacing.lg * 2 - spacing.md * 2);
	const plotW = chartW - LINE_PAD.l - LINE_PAD.r;
	const plotH = LINE_PLOT_H;
	const svgH = LINE_PAD.t + plotH + LINE_PAD.b;
	const n = data.length;

	const buildPts = (vals: number[]) =>
		vals.map((v, i) => ({
			x: LINE_PAD.l + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW),
			y: LINE_PAD.t + (1 - v / 100) * plotH,
		}));

	const bsiPts = buildPts(data.map((d) => d.bsi));
	const pcPts = buildPts(data.map((d) => d.parentConsistency));

	const toStr = (pts: { x: number; y: number }[]) =>
		pts.map((p) => `${p.x},${p.y}`).join(' ');

	const lines = [
		{ pts: bsiPts, color: colors.primary, label: "BSI Trend" },
		{ pts: pcPts, color: colors.growth, label: "Parent Consistency" },
	];

	return (
		<View>
			<View style={{ height: svgH }}>
				<Svg width={chartW} height={svgH}>
					{LINE_Y_TICKS.map((tick) => {
						const y = LINE_PAD.t + (1 - tick / 100) * plotH;
						return (
							<React.Fragment key={tick}>
								<Line
									x1={LINE_PAD.l}
									y1={y}
									x2={LINE_PAD.l + plotW}
									y2={y}
									stroke={colors.border}
									strokeWidth={0.5}
									strokeDasharray="4 6"
									opacity={0.85}
								/>
								<SvgText
									x={LINE_PAD.l - 6}
									y={y + 4}
									fontSize={10}
									fill={colors.textMuted}
									textAnchor="end"
								>
									{tick}
								</SvgText>
							</React.Fragment>
						);
					})}

					{lines.map(({ pts, color, label }) => (
						<React.Fragment key={label}>
							<Polyline
								points={toStr(pts)}
								fill="none"
								stroke={color}
								strokeWidth={2.5}
								strokeLinejoin="round"
								strokeLinecap="round"
								opacity={0.9}
							/>
							{pts.map((p, i) => (
								<Circle
									key={`${label}-${i}`}
									cx={p.x}
									cy={p.y}
									r={4}
									fill={color}
									stroke={colors.surface}
									strokeWidth={2}
								/>
							))}
						</React.Fragment>
					))}

					{data.map((d, i) => {
						const x = n <= 1 ? LINE_PAD.l + plotW / 2 : LINE_PAD.l + (i / (n - 1)) * plotW;
						return (
							<SvgText
								key={d.label}
								x={x}
								y={svgH - 6}
								fontSize={10}
								fill={colors.textSecondary}
								textAnchor="middle"
							>
								{d.label}
							</SvgText>
						);
					})}
				</Svg>
			</View>

			{/* Legend */}
			<View style={s.trendLegend}>
				{lines.map(({ color, label }) => (
					<View key={label} style={s.legendChip}>
						<View style={[s.legendDot, { backgroundColor: color }]} />
						<Text style={s.legendChipText}>{label}</Text>
					</View>
				))}
			</View>
		</View>
	);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  BEHAVIOUR HEATMAP (Calendar style)                               */
/* ═══════════════════════════════════════════════════════════════════ */
const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function BehaviourHeatmap({
	data,
	year,
	month,
}: {
	data: DailyBehaviourScore[];
	year: number;
	month: number;
}) {
	const { width: windowWidth } = useWindowDimensions();
	const cardInnerWidth = windowWidth - spacing.lg * 2 - spacing.md * 2;
	const cellGap = 4;
	const cellSize = Math.floor((cardInnerWidth - cellGap * 6) / 7);

	const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	// Build grid with leading empties
	const cells: (DailyBehaviourScore | null)[] = [];
	for (let i = 0; i < firstDay; i++) cells.push(null);
	data.forEach((d) => cells.push(d));

	const rows: (DailyBehaviourScore | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) {
		rows.push(cells.slice(i, i + 7));
	}

	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December',
	];

	return (
		<View>
			{/* Month label */}
			<Text style={s.heatmapMonthLabel}>{monthNames[month]} {year}</Text>

			{/* Day headers */}
			<View style={[s.heatmapRow, { gap: cellGap, marginBottom: cellGap }]}>
				{DAYS_HEADER.map((d, i) => (
					<View key={i} style={{ width: cellSize, alignItems: 'center' }}>
						<Text style={s.heatmapDayHeader}>{d}</Text>
					</View>
				))}
			</View>

			{/* Calendar grid */}
			{rows.map((row, ri) => (
				<View key={ri} style={[s.heatmapRow, { gap: cellGap, marginBottom: cellGap }]}>
					{row.map((cell, ci) => {
						if (!cell) {
							return (
								<View
									key={`empty-${ri}-${ci}`}
									style={{
										width: cellSize,
										height: cellSize,
										borderRadius: 6,
										backgroundColor: 'transparent',
									}}
								/>
							);
						}
						const bg = heatmapColor(cell.score);
						const dayNum = parseInt(cell.date.split('-')[2], 10);
						return (
							<View
								key={cell.date}
								style={{
									width: cellSize,
									height: cellSize,
									borderRadius: 6,
									backgroundColor: bg,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Text
									style={{
										fontSize: 10,
										fontWeight: '700',
										color: cell.score === null ? colors.textMuted : '#FFF',
										opacity: cell.score === null ? 0.6 : 1,
									}}
								>
									{dayNum}
								</Text>
							</View>
						);
					})}
					{/* Fill trailing empty cells to keep alignment */}
					{row.length < 7 &&
						Array.from({ length: 7 - row.length }).map((_, ti) => (
							<View
								key={`pad-${ri}-${ti}`}
								style={{
									width: cellSize,
									height: cellSize,
									borderRadius: 6,
									backgroundColor: 'transparent',
								}}
							/>
						))}
				</View>
			))}

			{/* Legend */}
			<View style={s.heatmapLegendRow}>
				<View style={s.heatmapLegendItem}>
					<View style={[s.heatmapLegendDot, { backgroundColor: '#E87070' }]} />
					<Text style={s.heatmapLegendText}>Needs Effort</Text>
				</View>
				<View style={s.heatmapLegendItem}>
					<View style={[s.heatmapLegendDot, { backgroundColor: '#F5C142' }]} />
					<Text style={s.heatmapLegendText}>Average</Text>
				</View>
				<View style={s.heatmapLegendItem}>
					<View style={[s.heatmapLegendDot, { backgroundColor: '#7BCF7B' }]} />
					<Text style={s.heatmapLegendText}>Consistent</Text>
				</View>
				<View style={s.heatmapLegendItem}>
					<View style={[s.heatmapLegendDot, { backgroundColor: '#2E8B57' }]} />
					<Text style={s.heatmapLegendText}>Excellent</Text>
				</View>
			</View>
		</View>
	);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN ANALYTICS SCREEN                                            */
/* ═══════════════════════════════════════════════════════════════════ */

const AnalyticsScreen: React.FC = () => {
	const insets = useSafeAreaInsets();
	const { width: windowWidth } = useWindowDimensions();
	const { children, selectedChildId } = useChildren();

	const scrollBottomPad = useMemo(
		() => getFloatingTabBarBottomPadding(insets.bottom),
		[insets.bottom]
	);

	const selectedChild = useMemo(
		() => children.find((c) => c.id === selectedChildId) ?? children[0],
		[children, selectedChildId]
	);

	// Data sources
	const bsi = useMemo(() => getSdsAnalytics(selectedChild.id), [selectedChild.id]);
	const fs = useMemo(() => getFamilyScore(selectedChild.id), [selectedChild.id]);
	const trust = useMemo(() => getTrustMeter(selectedChild.id), [selectedChild.id]);
	const pc = useMemo(() => getParentConsistency(selectedChild.id), [selectedChild.id]);
	const aspects = useMemo(() => getAspectScores(selectedChild.id), [selectedChild.id]);
	const dualTrend = useMemo(() => getDualTrendData(selectedChild.id), [selectedChild.id]);
	const counters = useMemo(() => getSummaryCounters(selectedChild.id), [selectedChild.id]);
	const guidance = useMemo(() => getGuidance(selectedChild.id), [selectedChild.id]);
	const badges = useMemo(() => getBadges(selectedChild.id), [selectedChild.id]);
	const sw = useMemo(
		() => getStrengthsWeaknesses(selectedChild.id),
		[selectedChild.id]
	);

	// Heatmap state
	const now = new Date();
	const [heatmapYear, setHeatmapYear] = useState(now.getFullYear());
	const [heatmapMonth, setHeatmapMonth] = useState(now.getMonth());
	const dbsData = useMemo(
		() => getDailyBehaviourScores(selectedChild.id, heatmapYear, heatmapMonth),
		[selectedChild.id, heatmapYear, heatmapMonth]
	);

	// BSI toggle state
	const [bsiPeriod, setBsiPeriod] = useState<'weekly' | 'monthly'>('weekly');

	/* Status bar management */
	useFocusEffect(
		useCallback(() => {
			setStatusBarStyle('light');
			if (Platform.OS === 'android') {
				RNStatusBar.setTranslucent(true);
				RNStatusBar.setBackgroundColor('transparent');
			}
			return () => {
				setStatusBarStyle('dark');
				if (Platform.OS === 'android') {
					RNStatusBar.setTranslucent(false);
					RNStatusBar.setBackgroundColor(colors.background);
				}
			};
		}, [])
	);

	const bsiColor = scoreColor(bsi.percent);

	/* Heatmap month navigation */
	const prevMonth = () => {
		if (heatmapMonth === 0) {
			setHeatmapYear((y) => y - 1);
			setHeatmapMonth(11);
		} else {
			setHeatmapMonth((m) => m - 1);
		}
	};
	const nextMonth = () => {
		if (heatmapMonth === 11) {
			setHeatmapYear((y) => y + 1);
			setHeatmapMonth(0);
		} else {
			setHeatmapMonth((m) => m + 1);
		}
	};

	return (
		<SafeAreaView style={s.root} edges={['left', 'right', 'bottom']}>
			<AppGradientHeader
				title="Progress & Analytics"
				subtitle={`${selectedChild.name}'s Insights`}
			/>

			<ScrollView
				style={s.scroll}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={[
					s.scrollContent,
					{ paddingBottom: scrollBottomPad },
				]}
			>
				{/* ════════ 1. BSI Hero Section ════════ */}
				<Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
					<View style={s.heroSection}>
						<Card variant="elevated" padding={spacing.md} style={s.bsiCard}>
							{/* Header row with title + toggle */}
							<View style={s.bsiHeaderRow}>
								<Text style={s.bsiTitle}>Behaviour Score Index (BSI)</Text>
								<View style={s.bsiToggle}>
									<Pressable
										onPress={() => setBsiPeriod('weekly')}
										style={[
											s.bsiToggleBtn,
											bsiPeriod === 'weekly' && s.bsiToggleBtnActive,
										]}
									>
										<Text
											style={[
												s.bsiToggleText,
												bsiPeriod === 'weekly' && s.bsiToggleTextActive,
											]}
										>
											Weekly
										</Text>
									</Pressable>
									<Pressable
										onPress={() => setBsiPeriod('monthly')}
										style={[
											s.bsiToggleBtn,
											bsiPeriod === 'monthly' && s.bsiToggleBtnActive,
										]}
									>
										<Text
											style={[
												s.bsiToggleText,
												bsiPeriod === 'monthly' && s.bsiToggleTextActive,
											]}
										>
											Monthly
										</Text>
									</Pressable>
								</View>
							</View>

							{/* Gauge */}
							<View style={s.bsiGaugeWrap}>
								<SemiCircleGauge
									percent={bsi.percent}
									size={200}
									strokeWidth={18}
									fillColor={bsiColor}
									trackColor="rgba(0,0,0,0.06)"
								/>
								{/* Center overlay */}
								<View style={s.bsiCenterOverlay}>
									<AnimatedNumber
										value={bsi.percent}
										suffix="%"
										delay={200}
										duration={1200}
										style={[s.bsiBigNumber, { color: bsiColor, textAlign: 'center' }]}
									/>
									<View style={s.bsiLabelRow}>
										<Icon
											name={
												bsi.trend > 0
													? 'trending-up'
													: bsi.trend < 0
														? 'trending-down'
														: 'trending-flat'
											}
											size={16}
											color={bsiColor}
										/>
										<Text style={[s.bsiLabelText, { color: bsiColor }]}>
											{scoreLabel(bsi.percent)}
										</Text>
									</View>
								</View>
							</View>

							{/* Bottom info */}
							<View style={s.bsiBottomRow}>
								<View style={[s.bsiTrendPill, { backgroundColor: scoreBg(bsi.percent) }]}>
									<Text style={[s.bsiTrendText, { color: bsiColor }]}>
										This Week{' '}
										{bsi.trend > 0 ? `↑ ${bsi.trend}%` : bsi.trend < 0 ? `↓ ${Math.abs(bsi.trend)}%` : '→ 0%'}
									</Text>
								</View>
							</View>

							{/* AI insight line */}
							<Text style={s.bsiInsightLine}>
								{selectedChild.name} is doing well. Focus on{' '}
								<Text style={{ fontWeight: '800' }}>
									{sw.weakAreas.length > 0 ? sw.weakAreas[0].name : 'all areas'}
								</Text>
								.
							</Text>

							<TouchableOpacity style={s.viewHistoryBtn}>
								<Text style={s.viewHistoryText}>View History</Text>
								<Icon name="chevron-right" size={16} color={colors.primary} />
							</TouchableOpacity>
						</Card>
					</View>
				</Animated.View>

				{/* ════════ 2. Support KPI Gauges (3 semi-circles) ════════ */}
				<Animated.View
					entering={FadeInDown.delay(80).springify().damping(18).stiffness(220)}
				>
					<View style={s.kpiRow}>
						{/* Family Score */}
						<View style={s.kpiCard}>
							<SemiCircleGauge
								percent={fs.score}
								size={110}
								strokeWidth={10}
								fillColor={scoreColor(fs.score)}
								delay={100}
							/>
							<View style={s.kpiCenterOverlay}>
								<AnimatedNumber
									value={fs.score}
									suffix="%"
									delay={100}
									duration={1100}
									style={[s.kpiValue, { color: scoreColor(fs.score), textAlign: 'center' }]}
								/>
							</View>
							<Text style={s.kpiLabel}>Family Score</Text>
							<Text style={s.kpiSublabel}>{fs.subtitle}</Text>
							<View style={s.kpiTrendRow}>
								<Icon
									name={fs.trend >= 0 ? 'arrow-upward' : 'arrow-downward'}
									size={12}
									color={fs.trend >= 0 ? colors.growth : colors.error}
								/>
								<Text
									style={[
										s.kpiTrendText,
										{ color: fs.trend >= 0 ? colors.growth : colors.error },
									]}
								>
									{fs.trend >= 0 ? '+' : ''}{fs.trend}% this week
								</Text>
							</View>
						</View>

						{/* Trust Meter */}
						<View style={s.kpiCard}>
							<SemiCircleGauge
								percent={trust.level}
								size={110}
								strokeWidth={10}
								fillColor={scoreColor(trust.level)}
								delay={200}
							/>
							<View style={s.kpiCenterOverlay}>
								<AnimatedNumber
									value={trust.level}
									suffix="%"
									delay={200}
									duration={1100}
									style={[s.kpiValue, { color: scoreColor(trust.level), textAlign: 'center' }]}
								/>
							</View>
							<Text style={[s.kpiLabel, { color: scoreColor(trust.level) }]}>Trust Meter</Text>
							<Text style={s.kpiSublabel}>{trust.subtitle}</Text>
							<View style={s.kpiTrendRow}>
								<Icon
									name={trust.trend > 0 ? 'favorite' : trust.trend < 0 ? 'heart-broken' : 'favorite-border'}
									size={12}
									color={trust.trend >= 0 ? colors.growth : colors.error}
								/>
								<Text
									style={[
										s.kpiTrendText,
										{ color: trust.trend >= 0 ? colors.growth : colors.error },
									]}
								>
									{trust.trend === 0 ? '0%' : trust.trend > 0 ? `+${trust.trend}%` : `${trust.trend}%`}
								</Text>
							</View>
						</View>

						{/* Parent Consistency */}
						<View style={s.kpiCard}>
							<SemiCircleGauge
								percent={pc.score}
								size={110}
								strokeWidth={10}
								fillColor={scoreColor(pc.score)}
								delay={300}
							/>
							<View style={s.kpiCenterOverlay}>
								<AnimatedNumber
									value={pc.score}
									suffix="%"
									delay={300}
									duration={1100}
									style={[s.kpiValue, { color: scoreColor(pc.score), textAlign: 'center' }]}
								/>
							</View>
							<Text style={s.kpiLabel}>Parent Consistency</Text>
							<Text style={s.kpiSublabel}>{pc.subtitle}</Text>
							<View style={s.kpiTrendRow}>
								<Icon
									name={pc.trend >= 0 ? 'arrow-upward' : 'arrow-downward'}
									size={12}
									color={pc.trend >= 0 ? colors.growth : colors.error}
								/>
								<Text
									style={[
										s.kpiTrendText,
										{ color: pc.trend >= 0 ? colors.growth : colors.error },
									]}
								>
									{pc.trend >= 0 ? '+' : ''}{pc.trend}% this week
								</Text>
							</View>
						</View>
					</View>
				</Animated.View>

				{/* ════════ 3. Aspect Scores (5 round gauges) ════════ */}
				<Animated.View
					entering={FadeInDown.delay(160).springify().damping(18).stiffness(220)}
				>
					<View style={s.sectionWrap}>
						<View style={s.sectionHeaderRow}>
							<Text style={s.sectionTitle}>Aspect Scores</Text>
							<Text style={s.sectionSubtitle}>This week's breakdown</Text>
						</View>

						<View style={s.aspectGrid}>
							{aspects.map((aspect, idx) => (
								<View key={aspect.id} style={s.aspectCard}>
									{/* Icon + name */}
									<View style={s.aspectNameRow}>
										<View
											style={[
												s.aspectIconWrap,
												{ backgroundColor: aspect.softBg, borderColor: aspect.borderColor },
											]}
										>
											<Icon name={aspect.iconName} size={13} color={aspect.accent} />
										</View>
										<Text style={s.aspectName} numberOfLines={1}>
											{aspect.name}
										</Text>
									</View>
									{/* Gauge */}
									<RoundGauge
										percent={aspect.score}
										size={68}
										strokeWidth={7}
										fillColor={aspect.accent}
										trackColor={aspect.softBg}
										delay={idx * 80}
									/>
									{/* Trend */}
									<View style={s.aspectTrendRow}>
										<Icon
											name={aspect.change >= 0 ? 'trending-up' : 'trending-down'}
											size={12}
											color={aspect.change >= 0 ? colors.growth : colors.error}
										/>
										<Text
											style={[
												s.aspectTrendText,
												{ color: aspect.change >= 0 ? colors.growth : colors.error },
											]}
										>
											{aspect.change >= 0 ? '+' : ''}{aspect.change}% vs last wk
										</Text>
									</View>
								</View>
							))}
						</View>
					</View>
				</Animated.View>

				{/* ════════ 4. Behaviour Heatmap (DBS) ════════ */}
				<Animated.View
					entering={FadeInDown.delay(240).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={s.heatmapCard}>
						<View style={s.heatmapHeader}>
							<View>
								<Text style={s.sectionTitle}>Daily Behaviour Score</Text>
								<Text style={s.sectionSubtitle}>Calendar heatmap</Text>
							</View>
							<View style={s.heatmapNav}>
								<Pressable onPress={prevMonth} style={s.heatmapNavBtn}>
									<Icon name="chevron-left" size={20} color={colors.textSecondary} />
								</Pressable>
								<Pressable onPress={nextMonth} style={s.heatmapNavBtn}>
									<Icon name="chevron-right" size={20} color={colors.textSecondary} />
								</Pressable>
							</View>
						</View>

						<BehaviourHeatmap
							data={dbsData}
							year={heatmapYear}
							month={heatmapMonth}
						/>
					</Card>
				</Animated.View>

				{/* ════════ 5. Progress Trends (Dual Line Chart) ════════ */}
				<Animated.View
					entering={FadeInDown.delay(320).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={s.trendCard}>
						<View style={s.trendHeader}>
							<Text style={s.sectionTitle}>Progress Trends</Text>
							<Icon name="chevron-right" size={20} color={colors.textMuted} />
						</View>
						<Text style={s.sectionSubtitle}>BSI vs Parent Consistency this week</Text>

						<View style={{ marginTop: spacing.md }}>
							<DualLineChart data={dualTrend} />
						</View>

						<Text style={s.trendInsightText}>
							Parent consistency drives {selectedChild.name}'s behaviour.
						</Text>
					</Card>
				</Animated.View>

				{/* ════════ 6. Summary Counters (Stat Pills) ════════ */}
				<Animated.View
					entering={FadeInDown.delay(400).springify().damping(18).stiffness(220)}
				>
					<View style={s.statPillsRow}>
						<View style={s.statPill}>
							<Icon name="article" size={18} color={colors.primary} />
							<Text style={s.statPillValue}>{counters.totalLogs}</Text>
							<Text style={s.statPillLabel}>Parent Logs</Text>
						</View>
						<View style={s.statPill}>
							<Icon name="calendar-today" size={18} color={colors.growth} />
							<Text style={s.statPillValue}>{counters.activeDays}</Text>
							<Text style={s.statPillLabel}>Active Days</Text>
						</View>
						<View style={s.statPill}>
							<Icon name="list-alt" size={18} color={colors.accent} />
							<Text style={s.statPillValue}>{counters.totalEntries}</Text>
							<Text style={s.statPillLabel}>Total Entries</Text>
						</View>
						<View style={s.statPill}>
							<Icon name="local-fire-department" size={18} color="#E85D5D" />
							<Text style={s.statPillValue}>{counters.streak}</Text>
							<Text style={s.statPillLabel}>Day Streak</Text>
						</View>
					</View>
				</Animated.View>

				{/* ════════ 7. Insights Section ════════ */}

				{/* 7a. AI Insights / Guidance */}
				<Animated.View
					entering={FadeInDown.delay(480).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={s.insightCard}>
						<View style={s.insightHeader}>
							<View style={[s.insightIconWrap, { backgroundColor: colors.primaryLight }]}>
								<Icon name="auto-awesome" size={20} color={colors.primaryDark} />
							</View>
							<View style={s.insightHeaderText}>
								<Text style={s.insightTitle}>AI Insights</Text>
								<Text style={s.insightSubtitle}>
									Personalized tips based on recent data
								</Text>
							</View>
						</View>

						{guidance.map((item, idx) => {
							const iconMap = {
								tip: 'lightbulb',
								warning: 'warning-amber',
								suggestion: 'psychology',
							};
							const colorMap = {
								tip: colors.growth,
								warning: colors.warning,
								suggestion: colors.primary,
							};
							const bgMap = {
								tip: colors.mintSoft,
								warning: colors.peachSoft,
								suggestion: colors.lavenderSoft,
							};
							const borderMap = {
								tip: 'rgba(63, 169, 122, 0.25)',
								warning: 'rgba(232, 160, 74, 0.3)',
								suggestion: 'rgba(124, 106, 232, 0.25)',
							};
							return (
								<View
									key={item.id}
									style={[
										s.guidanceItem,
										{
											backgroundColor: bgMap[item.type],
											borderColor: borderMap[item.type],
										},
										idx === guidance.length - 1 && { marginBottom: 0 },
									]}
								>
									<View
										style={[
											s.guidanceItemIcon,
											{
												backgroundColor: colors.surface,
												borderColor: borderMap[item.type],
											},
										]}
									>
										<Icon
											name={iconMap[item.type]}
											size={18}
											color={colorMap[item.type]}
										/>
									</View>
									<View style={s.guidanceItemText}>
										<Text style={s.guidanceItemTitle}>{item.title}</Text>
										<Text style={s.guidanceItemMsg}>{item.message}</Text>
									</View>
								</View>
							);
						})}
					</Card>
				</Animated.View>

				{/* 7b. Strengths & Growth Areas */}
				<Animated.View
					entering={FadeInDown.delay(560).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={s.insightCard}>
						<View style={s.insightHeader}>
							<View style={[s.insightIconWrap, { backgroundColor: colors.growthLight }]}>
								<Icon name="insights" size={20} color={colors.growth} />
							</View>
							<View style={s.insightHeaderText}>
								<Text style={s.insightTitle}>Strengths & Growth Areas</Text>
								<Text style={s.insightSubtitle}>
									How {selectedChild.name} is doing across key behaviours
								</Text>
							</View>
						</View>

						{/* Strengths */}
						{sw.strengths.length > 0 && (
							<View style={s.swBlock}>
								<View style={s.swLabelRow}>
									<Icon name="check-circle" size={16} color={colors.growth} />
									<Text style={[s.swLabel, { color: '#145A3D' }]}>Strengths</Text>
								</View>
								<Text style={s.swSummary}>{sw.strengthSummary}</Text>
								<View style={s.swChips}>
									{sw.strengths.map((item) => (
										<View
											key={item.id}
											style={[
												s.swChip,
												{ backgroundColor: item.softBg, borderColor: item.borderColor },
											]}
										>
											<Icon name={item.iconName} size={14} color={item.accent} />
											<Text style={[s.swChipText, { color: item.accent }]}>
												{item.name} · {item.score}%
											</Text>
										</View>
									))}
								</View>
							</View>
						)}

						{/* Weak areas */}
						{sw.weakAreas.length > 0 && (
							<View style={[s.swBlock, s.swBlockWeak]}>
								<View style={s.swLabelRow}>
									<Icon name="flag" size={16} color={colors.warning} />
									<Text style={[s.swLabel, { color: '#8B4514' }]}>Needs Focus</Text>
								</View>
								<Text style={s.swSummary}>{sw.weakSummary}</Text>
								<View style={s.swChips}>
									{sw.weakAreas.map((item) => (
										<View
											key={item.id}
											style={[
												s.swChip,
												{
													backgroundColor: colors.peachSoft,
													borderColor: 'rgba(232, 160, 74, 0.35)',
												},
											]}
										>
											<Icon name={item.iconName} size={14} color={colors.warning} />
											<Text style={[s.swChipText, { color: '#8B4514' }]}>
												{item.name} · {item.score}%
											</Text>
										</View>
									))}
								</View>
							</View>
						)}
					</Card>
				</Animated.View>

				{/* 7c. Badges / Achievements */}
				<Animated.View
					entering={FadeInDown.delay(640).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={s.badgesCard}>
						<View style={s.insightHeader}>
							<View style={[s.insightIconWrap, { backgroundColor: colors.accentLight }]}>
								<Icon name="military-tech" size={20} color={colors.accent} />
							</View>
							<View style={s.insightHeaderText}>
								<Text style={s.insightTitle}>Badges & Achievements</Text>
								<Text style={s.insightSubtitle}>
									{badges.filter((b) => b.earned).length} of {badges.length} unlocked
								</Text>
							</View>
						</View>

						<View style={s.badgesGrid}>
							{badges.map((badge) => (
								<View
									key={badge.id}
									style={[
										s.badgeTile,
										!badge.earned && s.badgeTileLocked,
									]}
								>
									<View
										style={[
											s.badgeIconCircle,
											{
												backgroundColor: badge.earned
													? `${badge.color}22`
													: colors.surfaceMuted,
												borderColor: badge.earned
													? `${badge.color}55`
													: colors.border,
											},
										]}
									>
										<Icon
											name={badge.iconName}
											size={22}
											color={badge.earned ? badge.color : colors.textMuted}
										/>
									</View>
									<Text
										style={[
											s.badgeLabel,
											!badge.earned && s.badgeLabelLocked,
										]}
										numberOfLines={2}
									>
										{badge.label}
									</Text>
									<Text style={s.badgeDesc} numberOfLines={2}>
										{badge.description}
									</Text>
									{!badge.earned && (
										<View style={s.lockedChip}>
											<Icon name="lock" size={10} color={colors.textMuted} />
											<Text style={s.lockedChipText}>Locked</Text>
										</View>
									)}
								</View>
							))}
						</View>
					</Card>
				</Animated.View>

				{/* ════════ Report Download Section ════════ */}
				<Animated.View
					entering={FadeInDown.delay(720).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={s.reportCard}>
						<View style={s.insightHeader}>
							<View style={[s.insightIconWrap, { backgroundColor: colors.lavenderSoft }]}>
								<Icon name="picture-as-pdf" size={20} color={colors.primary} />
							</View>
							<View style={s.insightHeaderText}>
								<Text style={s.insightTitle}>Monthly Report</Text>
								<Text style={s.insightSubtitle}>
									Download PDF with all KPIs, trends & insights
								</Text>
							</View>
						</View>

						<TouchableOpacity style={s.downloadBtn}>
							<Icon name="file-download" size={18} color="#FFF" />
							<Text style={s.downloadBtnText}>Download PDF Report</Text>
						</TouchableOpacity>

						<TouchableOpacity style={s.goalReportBtn}>
							<Icon name="flag" size={16} color={colors.primary} />
							<Text style={s.goalReportBtnText}>Goal-wise Report</Text>
							<Icon name="chevron-right" size={16} color={colors.primary} />
						</TouchableOpacity>
					</Card>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default AnalyticsScreen;

/* ═══════════════════════════════════════════════════════════════════ */
/*  STYLES                                                           */
/* ═══════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.background,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: spacing.sm,
	},

	/* ── 1. BSI Hero ── */
	heroSection: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.xs,
	},
	bsiCard: {
		marginHorizontal: 0,
	},
	bsiHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: spacing.sm,
	},
	bsiTitle: {
		...textStyles.caption,
		fontWeight: '700',
		color: colors.textSecondary,
		textTransform: 'uppercase',
		letterSpacing: 0.8,
		flex: 1,
	},
	bsiToggle: {
		flexDirection: 'row',
		backgroundColor: colors.surfaceMuted,
		borderRadius: borderRadius.full,
		padding: 2,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	bsiToggleBtn: {
		paddingHorizontal: spacing.md,
		paddingVertical: 5,
		borderRadius: borderRadius.full,
	},
	bsiToggleBtnActive: {
		backgroundColor: colors.surface,
		...Platform.select({
			ios: {
				shadowColor: colors.ink,
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.08,
				shadowRadius: 4,
			},
			android: { elevation: 2 },
			default: {},
		}),
	},
	bsiToggleText: {
		fontSize: 11,
		fontWeight: '700',
		color: colors.textMuted,
		letterSpacing: 0.2,
	},
	bsiToggleTextActive: {
		color: colors.primary,
	},
	bsiGaugeWrap: {
		alignItems: 'center',
		position: 'relative',
		marginBottom: spacing.xs,
	},
	bsiCenterOverlay: {
		position: 'absolute',
		top: 52,
		alignItems: 'center',
	},
	bsiBigNumber: {
		fontSize: 38,
		fontWeight: '800',
		letterSpacing: -1.5,
		lineHeight: 42,
	},
	bsiLabelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 2,
	},
	bsiLabelText: {
		fontSize: 13,
		fontWeight: '700',
		letterSpacing: 0.2,
	},
	bsiBottomRow: {
		alignItems: 'center',
		marginBottom: spacing.sm,
	},
	bsiTrendPill: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing.md,
		paddingVertical: 5,
		borderRadius: borderRadius.full,
		gap: 4,
	},
	bsiTrendText: {
		fontSize: 12,
		fontWeight: '700',
		letterSpacing: 0.2,
	},
	bsiInsightLine: {
		...textStyles.bodyMedium,
		fontSize: 13,
		color: colors.textPrimary,
		textAlign: 'center',
		lineHeight: 19,
		marginBottom: spacing.sm,
		paddingHorizontal: spacing.sm,
	},
	viewHistoryBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: spacing.sm,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: colors.border,
		gap: 4,
	},
	viewHistoryText: {
		fontSize: 13,
		fontWeight: '700',
		color: colors.primary,
		letterSpacing: 0.2,
	},

	/* ── 2. KPI Gauges ── */
	kpiRow: {
		flexDirection: 'row',
		paddingHorizontal: spacing.lg,
		gap: spacing.sm,
		marginBottom: spacing.md,
	},
	kpiCard: {
		flex: 1,
		backgroundColor: colors.surface,
		borderRadius: borderRadius.xl,
		padding: spacing.sm,
		paddingTop: spacing.md,
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		...Platform.select({
			ios: {
				shadowColor: colors.ink,
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.06,
				shadowRadius: 16,
			},
			android: { elevation: 3 },
			default: {},
		}),
		position: 'relative',
	},
	kpiCenterOverlay: {
		position: 'absolute',
		top: spacing.md + 28,
		alignItems: 'center',
	},
	kpiValue: {
		fontSize: 18,
		fontWeight: '800',
		letterSpacing: -0.5,
	},
	kpiLabel: {
		...textStyles.caption,
		fontWeight: '700',
		color: colors.ink,
		textAlign: 'center',
		marginTop: -4,
		fontSize: 11,
	},
	kpiSublabel: {
		fontSize: 9,
		color: colors.textMuted,
		textAlign: 'center',
		marginTop: 1,
		letterSpacing: 0.1,
	},
	kpiTrendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		marginTop: 4,
	},
	kpiTrendText: {
		fontSize: 9,
		fontWeight: '700',
	},

	/* ── 3. Aspect Scores ── */
	sectionWrap: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.md,
	},
	sectionHeaderRow: {
		marginBottom: spacing.md,
	},
	sectionTitle: {
		...textStyles.headingMedium,
		fontSize: 18,
		fontWeight: '800',
		color: colors.ink,
		letterSpacing: -0.3,
	},
	sectionSubtitle: {
		...textStyles.caption,
		color: colors.textSecondary,
		marginTop: 2,
	},
	aspectGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
		justifyContent: 'center',
	},
	aspectCard: {
		width: '30%',
		minWidth: 100,
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		padding: spacing.sm,
		paddingVertical: spacing.md,
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		...Platform.select({
			ios: {
				shadowColor: colors.ink,
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.04,
				shadowRadius: 8,
			},
			android: { elevation: 1 },
			default: {},
		}),
	},
	aspectNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginBottom: spacing.xs,
	},
	aspectIconWrap: {
		width: 22,
		height: 22,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
	},
	aspectName: {
		...textStyles.caption,
		fontWeight: '700',
		color: colors.ink,
		fontSize: 11,
		flexShrink: 1,
	},
	aspectTrendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		marginTop: spacing.xs,
	},
	aspectTrendText: {
		fontSize: 9,
		fontWeight: '700',
	},

	/* ── 4. Heatmap ── */
	heatmapCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	heatmapHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		marginBottom: spacing.md,
	},
	heatmapNav: {
		flexDirection: 'row',
		gap: 4,
	},
	heatmapNavBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.surfaceMuted,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	heatmapMonthLabel: {
		...textStyles.caption,
		fontWeight: '700',
		color: colors.textSecondary,
		textAlign: 'center',
		marginBottom: spacing.sm,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	heatmapRow: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
	},
	heatmapDayHeader: {
		fontSize: 10,
		fontWeight: '700',
		color: colors.textMuted,
		letterSpacing: 0.2,
	},
	heatmapLegendRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: spacing.sm,
		marginTop: spacing.md,
		flexWrap: 'wrap',
	},
	heatmapLegendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	heatmapLegendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	heatmapLegendText: {
		fontSize: 10,
		fontWeight: '600',
		color: colors.textSecondary,
	},

	/* ── 5. Progress Trends ── */
	trendCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	trendHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	trendLegend: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: spacing.md,
		marginTop: spacing.sm,
	},
	trendInsightText: {
		...textStyles.caption,
		fontSize: 12,
		color: colors.textSecondary,
		textAlign: 'center',
		marginTop: spacing.md,
		fontStyle: 'italic',
	},

	/* ── 6. Summary Counters ── */
	statPillsRow: {
		flexDirection: 'row',
		paddingHorizontal: spacing.lg,
		gap: spacing.sm,
		marginBottom: spacing.md,
		flexWrap: 'wrap',
	},
	statPill: {
		flex: 1,
		minWidth: 70,
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.sm,
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		gap: 4,
		...Platform.select({
			ios: {
				shadowColor: colors.ink,
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.04,
				shadowRadius: 8,
			},
			android: { elevation: 1 },
			default: {},
		}),
	},
	statPillValue: {
		fontSize: 20,
		fontWeight: '800',
		color: colors.ink,
		letterSpacing: -0.5,
	},
	statPillLabel: {
		...textStyles.caption,
		fontSize: 10,
		fontWeight: '600',
		color: colors.textSecondary,
		textAlign: 'center',
	},

	/* ── 7. Insights / Guidance / Strengths ── */
	insightCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	insightHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.md,
		marginBottom: spacing.md,
	},
	insightIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(124, 106, 232, 0.22)',
	},
	insightHeaderText: {
		flex: 1,
		minWidth: 0,
	},
	insightTitle: {
		...textStyles.headingMedium,
		fontSize: 17,
		fontWeight: '800',
		color: colors.ink,
		marginBottom: 4,
	},
	insightSubtitle: {
		...textStyles.caption,
		fontSize: 12,
		color: colors.textSecondary,
		lineHeight: 17,
	},

	/* Guidance items */
	guidanceItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.sm,
		padding: spacing.md,
		borderRadius: borderRadius.large,
		borderWidth: StyleSheet.hairlineWidth,
		marginBottom: spacing.sm,
	},
	guidanceItemIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
	},
	guidanceItemText: {
		flex: 1,
		minWidth: 0,
	},
	guidanceItemTitle: {
		...textStyles.bodyLarge,
		fontSize: 14,
		fontWeight: '800',
		color: colors.ink,
		marginBottom: 3,
	},
	guidanceItemMsg: {
		...textStyles.bodyMedium,
		fontSize: 13,
		color: colors.textPrimary,
		lineHeight: 19,
	},

	/* Strengths / Weak areas */
	swBlock: {
		backgroundColor: colors.mintSoft,
		borderRadius: borderRadius.large,
		padding: spacing.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(63, 169, 122, 0.25)',
		marginBottom: spacing.sm,
	},
	swBlockWeak: {
		backgroundColor: colors.peachSoft,
		borderColor: 'rgba(232, 160, 74, 0.3)',
		marginBottom: 0,
	},
	swLabelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
		marginBottom: spacing.xs,
	},
	swLabel: {
		fontSize: 14,
		fontWeight: '800',
		letterSpacing: -0.2,
	},
	swSummary: {
		...textStyles.bodyMedium,
		fontSize: 13,
		color: colors.textPrimary,
		lineHeight: 19,
		marginBottom: spacing.sm,
	},
	swChips: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
	},
	swChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		paddingHorizontal: spacing.sm,
		paddingVertical: 5,
		borderRadius: borderRadius.full,
		borderWidth: StyleSheet.hairlineWidth,
	},
	swChipText: {
		fontSize: 12,
		fontWeight: '700',
	},

	/* ── Badges ── */
	badgesCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	badgesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
	},
	badgeTile: {
		width: '47%',
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		padding: spacing.md,
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	badgeTileLocked: {
		opacity: 0.5,
	},
	badgeIconCircle: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		marginBottom: spacing.sm,
	},
	badgeLabel: {
		...textStyles.bodyMedium,
		fontSize: 13,
		fontWeight: '800',
		color: colors.ink,
		textAlign: 'center',
		marginBottom: 3,
	},
	badgeLabelLocked: {
		color: colors.textMuted,
	},
	badgeDesc: {
		...textStyles.caption,
		fontSize: 11,
		color: colors.textSecondary,
		textAlign: 'center',
		lineHeight: 15,
	},
	lockedChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: spacing.xs,
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: borderRadius.full,
		backgroundColor: colors.surfaceMuted,
	},
	lockedChipText: {
		fontSize: 9,
		fontWeight: '700',
		color: colors.textMuted,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},

	/* ── Report Section ── */
	reportCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.xl,
	},
	downloadBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		backgroundColor: colors.primary,
		paddingVertical: spacing.md,
		borderRadius: borderRadius.large,
		marginBottom: spacing.sm,
		...Platform.select({
			ios: {
				shadowColor: colors.primary,
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.3,
				shadowRadius: 8,
			},
			android: { elevation: 4 },
			default: {},
		}),
	},
	downloadBtnText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#FFF',
		letterSpacing: 0.3,
	},
	goalReportBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		paddingVertical: spacing.sm,
		borderRadius: borderRadius.large,
		backgroundColor: colors.lavenderSoft,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(124, 106, 232, 0.3)',
	},
	goalReportBtnText: {
		fontSize: 13,
		fontWeight: '700',
		color: colors.primary,
		flex: 1,
	},

	/* ── Shared Legend ── */
	legendChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingVertical: 5,
		paddingHorizontal: spacing.sm,
		borderRadius: borderRadius.full,
		backgroundColor: colors.surfaceMuted,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	legendChipText: {
		...textStyles.caption,
		fontSize: 11,
		fontWeight: '700',
		color: colors.textPrimary,
	},
});
