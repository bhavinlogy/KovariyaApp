import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	TouchableOpacity,
	Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import { scoreColor, scoreBg, scoreLabel, scoreTint, scoreBorder } from '../utils';
import { AnimatedNumber, SemiCircleGauge } from './gauges';
import type { SdsAnalytics, StrengthWeakness } from '../../../data/analyticsData';

/* ═══════════════════════════════════════════════════════════════════ */
/*  Props                                                             */
/* ═══════════════════════════════════════════════════════════════════ */
interface BSIGaugeCardProps {
	bsi: SdsAnalytics;
	childName: string;
	weakAreas: StrengthWeakness['weakAreas'];
	bsiPeriod: 'weekly' | 'monthly';
	onTogglePeriod: (period: 'weekly' | 'monthly') => void;
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const BSIGaugeCard: React.FC<BSIGaugeCardProps> = ({
	bsi,
	childName,
	weakAreas,
	bsiPeriod,
	onTogglePeriod,
}) => {
	const bsiColor = scoreColor(bsi.percent);
	const tintBg = scoreTint(bsi.percent);
	const tintBorder = scoreBorder(bsi.percent);

	return (
		<Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
			<View style={s.heroSection}>
				<View
					style={[
						s.bsiCard,
						{
							backgroundColor: tintBg,
							borderColor: tintBorder,
						},
					]}
				>
					{/* Header row with title + toggle */}
					<View style={s.bsiHeaderRow}>
						<Text style={s.bsiTitle}>Behaviour Score Index (BSI)</Text>
						<View style={s.bsiToggle}>
							<Pressable
								onPress={() => onTogglePeriod('weekly')}
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
								onPress={() => onTogglePeriod('monthly')}
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
						{childName} is doing well. Focus on{' '}
						<Text style={{ fontWeight: '800' }}>
							{weakAreas.length > 0 ? weakAreas[0].name : 'all areas'}
						</Text>
						.
					</Text>

					<TouchableOpacity style={s.viewHistoryBtn}>
						<Text style={s.viewHistoryText}>View History</Text>
						<Icon name="chevron-right" size={16} color={colors.primary} />
					</TouchableOpacity>
				</View>
			</View>
		</Animated.View>
	);
};

export default React.memo(BSIGaugeCard);

/* ═══════════════════════════════════════════════════════════════════ */
/*  Styles                                                            */
/* ═══════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
	heroSection: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.xs,
	},
	bsiCard: {
		flex: 1,
		borderRadius: borderRadius.xl,
		padding: spacing.md,
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
		marginVertical: spacing.sm,
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
		backgroundColor: 'rgba(255,255,255,0.7)',
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
		borderTopColor: 'rgba(0,0,0,0.06)',
		gap: 4,
	},
	viewHistoryText: {
		fontSize: 13,
		fontWeight: '700',
		color: colors.primary,
		letterSpacing: 0.2,
	},
});
