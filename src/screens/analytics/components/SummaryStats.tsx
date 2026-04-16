import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import type { SummaryCounters } from '../../../data/analyticsData';

/* ═══════════════════════════════════════════════════════════════════ */
/*  Props                                                             */
/* ═══════════════════════════════════════════════════════════════════ */
interface SummaryStatsProps {
	counters: SummaryCounters;
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Constants                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const STAT_PILLS = [
	{ key: 'totalLogs', icon: 'article', color: colors.primary, label: 'Parent Logs' },
	{ key: 'activeDays', icon: 'calendar-today', color: colors.growth, label: 'Active Days' },
	{ key: 'totalEntries', icon: 'list-alt', color: colors.accent, label: 'Total Entries' },
	{ key: 'streak', icon: 'local-fire-department', color: '#E85D5D', label: 'Day Streak' },
] as const;

/* ═══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const SummaryStats: React.FC<SummaryStatsProps> = ({ counters }) => {
	return (
		<Animated.View
			entering={FadeInDown.delay(400).springify().damping(18).stiffness(220)}
		>
			<View style={s.statPillsRow}>
				{STAT_PILLS.map((pill) => (
					<View key={pill.key} style={s.statPill}>
						<Icon name={pill.icon} size={18} color={pill.color} />
						<Text style={s.statPillValue}>{counters[pill.key]}</Text>
						<Text style={s.statPillLabel}>{pill.label}</Text>
					</View>
				))}
			</View>
		</Animated.View>
	);
};

export default React.memo(SummaryStats);

/* ═══════════════════════════════════════════════════════════════════ */
/*  Styles                                                            */
/* ═══════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
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
});
