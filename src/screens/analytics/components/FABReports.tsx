import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Card } from '../../../components';
import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import { analyticsStyles as shared } from '../styles';

/* ═══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const FABReports: React.FC = () => {
	return (
		<Animated.View
			entering={FadeInDown.delay(720).springify().damping(18).stiffness(220)}
		>
			<Card variant="elevated" padding={spacing.md} style={s.reportCard}>
				<View style={shared.insightHeader}>
					<View style={[shared.insightIconWrap, { backgroundColor: colors.lavenderSoft }]}>
						<Icon name="picture-as-pdf" size={20} color={colors.primary} />
					</View>
					<View style={shared.insightHeaderText}>
						<Text style={shared.insightTitle}>Monthly Report</Text>
						<Text style={shared.insightSubtitle}>
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
	);
};

export default React.memo(FABReports);

/* ═══════════════════════════════════════════════════════════════════ */
/*  Styles                                                            */
/* ═══════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
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
});
