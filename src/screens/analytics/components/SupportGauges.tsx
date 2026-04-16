import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import { scoreColor } from '../utils';
import { SemiCircleGauge, AnimatedNumber } from './gauges';
import type {
	FamilyScoreData,
	TrustMeterData,
	ParentConsistencyData,
} from '../../../data/analyticsData';

/* ═══════════════════════════════════════════════════════════════════ */
/*  Props                                                             */
/* ═══════════════════════════════════════════════════════════════════ */
interface SupportGaugesProps {
	familyScore: FamilyScoreData;
	trust: TrustMeterData;
	parentConsistency: ParentConsistencyData;
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const SupportGauges: React.FC<SupportGaugesProps> = ({
	familyScore: fs,
	trust,
	parentConsistency: pc,
}) => {
	const gauges = [
		{
			value: fs.score,
			label: 'Family Score',
			sublabel: fs.subtitle,
			delay: 100,
			trendIcon: fs.trend >= 0 ? 'arrow-upward' : 'arrow-downward',
			trendText: `${fs.trend >= 0 ? '+' : ''}${fs.trend}% this week`,
			trendColor: fs.trend >= 0 ? colors.growth : colors.error,
			labelColor: undefined,
		},
		{
			value: trust.level,
			label: 'Trust Meter',
			sublabel: trust.subtitle,
			delay: 200,
			trendIcon: trust.trend > 0 ? 'favorite' : trust.trend < 0 ? 'heart-broken' : 'favorite-border',
			trendText: trust.trend === 0 ? '0%' : trust.trend > 0 ? `+${trust.trend}%` : `${trust.trend}%`,
			trendColor: trust.trend >= 0 ? colors.growth : colors.error,
			labelColor: scoreColor(trust.level),
		},
		{
			value: pc.score,
			label: 'Parent Consistency',
			sublabel: pc.subtitle,
			delay: 300,
			trendIcon: pc.trend >= 0 ? 'arrow-upward' : 'arrow-downward',
			trendText: `${pc.trend >= 0 ? '+' : ''}${pc.trend}% this week`,
			trendColor: pc.trend >= 0 ? colors.growth : colors.error,
			labelColor: undefined,
		},
	];

	return (
		<Animated.View
			entering={FadeInDown.delay(80).springify().damping(18).stiffness(220)}
		>
			<View style={s.kpiRow}>
				{gauges.map((g) => (
					<View key={g.label} style={s.kpiCard}>
						<SemiCircleGauge
							percent={g.value}
							size={110}
							strokeWidth={10}
							fillColor={scoreColor(g.value)}
							delay={g.delay}
						/>
						<View style={s.kpiCenterOverlay}>
							<AnimatedNumber
								value={g.value}
								suffix="%"
								delay={g.delay}
								duration={1100}
								style={[s.kpiValue, { color: scoreColor(g.value), textAlign: 'center' }]}
							/>
						</View>
						<Text style={[s.kpiLabel, g.labelColor ? { color: g.labelColor } : undefined]}>
							{g.label}
						</Text>
						<Text style={s.kpiSublabel}>{g.sublabel}</Text>
						<View style={s.kpiTrendRow}>
							<Icon name={g.trendIcon} size={12} color={g.trendColor} />
							<Text style={[s.kpiTrendText, { color: g.trendColor }]}>
								{g.trendText}
							</Text>
						</View>
					</View>
				))}
			</View>
		</Animated.View>
	);
};

export default React.memo(SupportGauges);

/* ═══════════════════════════════════════════════════════════════════ */
/*  Styles                                                            */
/* ═══════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
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
});
