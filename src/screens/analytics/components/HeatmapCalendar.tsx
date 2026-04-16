import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Card } from '../../../components';
import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import { heatmapColor } from '../utils';
import type { DailyBehaviourScore } from '../../../data/analyticsData';

/* ═══════════════════════════════════════════════════════════════════ */
/*  Props                                                             */
/* ═══════════════════════════════════════════════════════════════════ */
interface HeatmapCalendarProps {
	data: DailyBehaviourScore[];
	year: number;
	month: number;
	onPrevMonth: () => void;
	onNextMonth: () => void;
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Constants                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
	data,
	year,
	month,
	onPrevMonth,
	onNextMonth,
}) => {
	const { width: windowWidth } = useWindowDimensions();
	const cardInnerWidth = windowWidth - spacing.lg * 2 - spacing.md * 2;
	const cellGap = 4;
	const cellSize = Math.floor((cardInnerWidth - cellGap * 6) / 7);

	const firstDay = new Date(year, month, 1).getDay(); // 0=Sun

	// Build grid with leading empties
	const cells: (DailyBehaviourScore | null)[] = [];
	for (let i = 0; i < firstDay; i++) cells.push(null);
	data.forEach((d) => cells.push(d));

	const rows: (DailyBehaviourScore | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) {
		rows.push(cells.slice(i, i + 7));
	}

	return (
		<Animated.View
			entering={FadeInDown.delay(240).springify().damping(18).stiffness(220)}
		>
			<Card variant="elevated" padding={spacing.md} style={s.heatmapCard}>
				{/* Header */}
				<View style={s.heatmapHeader}>
					<View>
						<Text style={s.sectionTitle}>Daily Behaviour Score</Text>
						<Text style={s.sectionSubtitle}>Calendar heatmap</Text>
					</View>
					<View style={s.heatmapNav}>
						<Pressable onPress={onPrevMonth} style={s.heatmapNavBtn}>
							<Icon name="chevron-left" size={20} color={colors.textSecondary} />
						</Pressable>
						<Pressable onPress={onNextMonth} style={s.heatmapNavBtn}>
							<Icon name="chevron-right" size={20} color={colors.textSecondary} />
						</Pressable>
					</View>
				</View>

				{/* Month label */}
				<Text style={s.heatmapMonthLabel}>{MONTH_NAMES[month]} {year}</Text>

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
			</Card>
		</Animated.View>
	);
};

export default React.memo(HeatmapCalendar);

/* ═══════════════════════════════════════════════════════════════════ */
/*  Styles                                                            */
/* ═══════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
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
});
