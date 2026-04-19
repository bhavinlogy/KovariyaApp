import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, textStyles, borderRadius } from '../../../theme';

/**
 * Shared styles used by multiple analytics components.
 * Component-specific styles live inside each component file.
 */
export const analyticsStyles = StyleSheet.create({
	/* ── Layout ── */
	root: {
		flex: 1,
		backgroundColor: colors.background,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: spacing.xs,
		paddingHorizontal: spacing.lg,
	},
	heroWrap: {
		marginTop: -spacing.lg,
		marginBottom: spacing.md,
	},
	sectionBlock: {
		marginBottom: spacing.md,
	},
	softPanel: {
		backgroundColor: 'rgba(255,255,255,0.85)',
		borderRadius: borderRadius.xxl,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(17, 17, 17, 0.05)',
	},
	gradientCardShadow: {
		...Platform.select({
			ios: {
				shadowColor: colors.ink,
				shadowOffset: { width: 0, height: 10 },
				shadowOpacity: 0.07,
				shadowRadius: 22,
			},
			android: {
				elevation: 5,
			},
			default: {},
		}),
	},

	/* ── Section headers (reused in Aspects, Heatmap, Trends) ── */
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
	sectionEyebrow: {
		...textStyles.caption,
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 1.2,
		textTransform: 'uppercase',
		color: colors.primary,
		marginBottom: 3,
	},

	/* ── Insight-style card headers (AI Insights, Strengths, Badges, Report) ── */
	insightHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.md,
		marginBottom: spacing.md,
	},
	insightIconWrap: {
		width: 46,
		height: 46,
		borderRadius: 23,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(124, 106, 232, 0.18)',
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
		letterSpacing: -0.2,
	},
	insightSubtitle: {
		...textStyles.caption,
		fontSize: 12,
		color: colors.textSecondary,
		lineHeight: 17,
	},

	/* ── Uniform card spacing ── */
	cardMargin: {
		marginBottom: spacing.sm,
	},
});
