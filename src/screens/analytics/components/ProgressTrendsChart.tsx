import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Polyline, Line, Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Card } from '../../../components';
import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import type { DualTrendRow } from '../../../data/analyticsData';

/* ═══════════════════════════════════════════════════════════════════ */
/*  Chart constants                                                   */
/* ═══════════════════════════════════════════════════════════════════ */
const LINE_PAD = { l: 36, r: 14, t: 10, b: 24 };
const LINE_PLOT_H = 120;
const LINE_Y_TICKS = [100, 75, 50, 25];

/* ═══════════════════════════════════════════════════════════════════ */
/*  Props                                                             */
/* ═══════════════════════════════════════════════════════════════════ */
interface ProgressTrendsChartProps {
	data: DualTrendRow[];
	childName: string;
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const ProgressTrendsChart: React.FC<ProgressTrendsChartProps> = ({
	data,
	childName,
}) => {
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
		{ pts: bsiPts, color: colors.primary, label: 'BSI Trend' },
		{ pts: pcPts, color: colors.growth, label: 'Parent Consistency' },
	];

	return (
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
					{/* SVG chart */}
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

				<Text style={s.trendInsightText}>
					Parent consistency drives {childName}'s behaviour.
				</Text>
			</Card>
		</Animated.View>
	);
};

export default React.memo(ProgressTrendsChart);

/* ═══════════════════════════════════════════════════════════════════ */
/*  Styles                                                            */
/* ═══════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
	trendCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	trendHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
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
