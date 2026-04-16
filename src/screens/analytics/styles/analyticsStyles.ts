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
		paddingTop: spacing.sm,
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

	/* ── Insight-style card headers (AI Insights, Strengths, Badges, Report) ── */
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

	/* ── Uniform card spacing ── */
	cardMargin: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
});
