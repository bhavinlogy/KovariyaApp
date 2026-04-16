import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import { scoreColor, scoreTint, scoreBorder } from '../utils';
import { RoundGauge } from './gauges';
import type { AspectScoreRow } from '../../../data/analyticsData';

/* ═══════════════════════════════════════════════════════════════════ */
/*  Props                                                             */
/* ═══════════════════════════════════════════════════════════════════ */
interface AspectScoreGridProps {
	aspects: AspectScoreRow[];
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const AspectScoreGrid: React.FC<AspectScoreGridProps> = ({ aspects }) => {
	const { width: windowWidth } = useWindowDimensions();
	const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

	/**
	 * Match the Dashboard's grid layout:
	 * Row 1: 3 equal columns · Row 2: 2 equal columns
	 * Same gap G between all neighbours.
	 */
	const metrics = useMemo(() => {
		const horizontalPadding = spacing.lg * 2;
		const G = spacing.md;
		const inner = windowWidth - horizontalPadding;
		const width3 = Math.max(96, Math.floor((inner - 2 * G) / 3));
		const width2 = Math.max(140, Math.floor((inner - G) / 2));
		return { width3, width2, gap: G };
	}, [windowWidth]);

	const row1 = aspects.slice(0, 3);
	const row2 = aspects.slice(3, 5);

	return (
		<Animated.View
			entering={FadeInDown.delay(160).springify().damping(18).stiffness(220)}
		>
			<View style={s.sectionWrap}>
				{/* Header with toggle */}
				<View style={s.sectionHeaderRow}>
					<View style={s.headerLeft}>
						<Text style={s.sectionTitle}>Aspect Scores</Text>
						<Text style={s.sectionSubtitle}>
							{period === 'weekly' ? "This week's breakdown" : "This month's breakdown"}
						</Text>
					</View>
					<View style={s.toggle}>
						<Pressable
							onPress={() => setPeriod('weekly')}
							style={[
								s.toggleBtn,
								period === 'weekly' && s.toggleBtnActive,
							]}
						>
							<Text
								style={[
									s.toggleText,
									period === 'weekly' && s.toggleTextActive,
								]}
							>
								Weekly
							</Text>
						</Pressable>
						<Pressable
							onPress={() => setPeriod('monthly')}
							style={[
								s.toggleBtn,
								period === 'monthly' && s.toggleBtnActive,
							]}
						>
							<Text
								style={[
									s.toggleText,
									period === 'monthly' && s.toggleTextActive,
								]}
							>
								Monthly
							</Text>
						</Pressable>
					</View>
				</View>

				{/* Row 1: 3 columns */}
				<View style={[s.gridRow, { gap: metrics.gap, marginBottom: metrics.gap }]}>
					{row1.map((aspect, idx) => (
						<AspectTile
							key={aspect.id}
							aspect={aspect}
							width={metrics.width3}
							animDelay={idx * 80}
						/>
					))}
				</View>

				{/* Row 2: 2 columns */}
				<View style={[s.gridRow, { gap: metrics.gap }]}>
					{row2.map((aspect, idx) => (
						<AspectTile
							key={aspect.id}
							aspect={aspect}
							width={metrics.width2}
							animDelay={(3 + idx) * 80}
						/>
					))}
				</View>
			</View>
		</Animated.View>
	);
};

export default React.memo(AspectScoreGrid);

/* ═══════════════════════════════════════════════════════════════════ */
/*  Single Aspect Tile                                                */
/* ═══════════════════════════════════════════════════════════════════ */
interface AspectTileProps {
	aspect: AspectScoreRow;
	width: number;
	animDelay: number;
}

const AspectTile: React.FC<AspectTileProps> = React.memo(({
	aspect,
	width,
	animDelay,
}) => {
	const tileScoreColor = scoreColor(aspect.score);
	const tintBg = scoreTint(aspect.score);
	const tintBorderColor = scoreBorder(aspect.score);
	const trendColor = aspect.change >= 0 ? colors.growth : colors.error;

	return (
		<View
			style={[
				s.aspectCard,
				{
					width,
					backgroundColor: tintBg,
					borderColor: tintBorderColor,
				},
			]}
		>
			{/* Top accent bar */}
			<View style={[s.aspectTopAccent, { backgroundColor: aspect.accent }]} />

			{/* Card body */}
			<View style={s.aspectBody}>
				{/* Icon */}
				<View
					style={[
						s.aspectIconWrap,
						{ backgroundColor: `${aspect.accent}28` },
					]}
				>
					<Icon name={aspect.iconName} size={20} color={aspect.accent} />
				</View>

				{/* Name */}
				<Text style={s.aspectName} numberOfLines={2}>
					{aspect.name}
				</Text>

				{/* Gauge */}
				<RoundGauge
					percent={aspect.score}
					size={64}
					strokeWidth={7}
					fillColor={aspect.accent}
					trackColor={aspect.softBg}
					delay={animDelay}
				/>

				{/* Trend indicator */}
				<View style={[s.aspectTrendPill, { backgroundColor: `${trendColor}14` }]}>
					<Icon
						name={aspect.change >= 0 ? 'trending-up' : 'trending-down'}
						size={12}
						color={trendColor}
					/>
					<Text style={[s.aspectTrendText, { color: trendColor }]}>
						{aspect.change >= 0 ? '+' : ''}{aspect.change}%
					</Text>
				</View>
			</View>
		</View>
	);
});

/* ═══════════════════════════════════════════════════════════════════ */
/*  Styles                                                            */
/* ═══════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
	sectionWrap: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.md,
	},
	sectionHeaderRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		marginBottom: spacing.md,
	},
	headerLeft: {
		flex: 1,
		marginRight: spacing.sm,
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

	/* Toggle */
	toggle: {
		flexDirection: 'row',
		backgroundColor: colors.surfaceMuted,
		borderRadius: borderRadius.full,
		padding: 2,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	toggleBtn: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 5,
		borderRadius: borderRadius.full,
	},
	toggleBtnActive: {
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
	toggleText: {
		fontSize: 11,
		fontWeight: '700',
		color: colors.textMuted,
		letterSpacing: 0.2,
	},
	toggleTextActive: {
		color: colors.primary,
	},

	/* Grid */
	gridRow: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
	},

	/* Card */
	aspectCard: {
		borderRadius: borderRadius.large,
		borderWidth: StyleSheet.hairlineWidth,
		overflow: 'hidden',
		...Platform.select({
			ios: {
				shadowColor: colors.ink,
				shadowOffset: { width: 0, height: 3 },
				shadowOpacity: 0.06,
				shadowRadius: 8,
			},
			android: { elevation: 2 },
			default: {},
		}),
	},
	aspectTopAccent: {
		height: 3,
		width: '100%',
	},
	aspectBody: {
		paddingHorizontal: spacing.xs,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		alignItems: 'center',
	},
	aspectIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.xs,
	},
	aspectName: {
		fontSize: 13,
		fontWeight: '800',
		color: colors.ink,
		letterSpacing: -0.15,
		textAlign: 'center',
		marginBottom: spacing.xs,
		width: '100%',
	},
	aspectTrendPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: spacing.xs,
		paddingHorizontal: spacing.sm,
		paddingVertical: 3,
		borderRadius: borderRadius.full,
	},
	aspectTrendText: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.1,
	},
});
