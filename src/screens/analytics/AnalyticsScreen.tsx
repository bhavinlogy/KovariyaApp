import React, { useCallback, useMemo } from 'react';
import { ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { setStatusBarStyle } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppGradientHeader } from '../../components';
import { colors, getFloatingTabBarBottomPadding } from '../../theme';
import { analyticsStyles as s } from './styles';
import { useAnalyticsData } from './hooks';
import {
	BSIGaugeCard,
	SupportGauges,
	AspectScoreGrid,
	HeatmapCalendar,
	ProgressTrendsChart,
	SummaryStats,
	InsightsSection,
	FABReports,
} from './components';

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN ANALYTICS SCREEN                                             */
/* ═══════════════════════════════════════════════════════════════════ */
const AnalyticsScreen: React.FC = () => {
	const insets = useSafeAreaInsets();

	const scrollBottomPad = useMemo(
		() => getFloatingTabBarBottomPadding(insets.bottom),
		[insets.bottom]
	);

	const {
		selectedChild,
		bsi,
		familyScore,
		trust,
		parentConsistency,
		aspects,
		dualTrend,
		counters,
		guidance,
		badges,
		strengthsWeaknesses,
		heatmapData,
		heatmapYear,
		heatmapMonth,
		prevMonth,
		nextMonth,
		bsiPeriod,
		setBsiPeriod,
	} = useAnalyticsData();

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
				{/* 1. BSI Hero Section */}
				<BSIGaugeCard
					bsi={bsi}
					childName={selectedChild.name}
					weakAreas={strengthsWeaknesses.weakAreas}
					bsiPeriod={bsiPeriod}
					onTogglePeriod={setBsiPeriod}
				/>

				{/* 2. Support KPI Gauges (3 semi-circles) */}
				<SupportGauges
					familyScore={familyScore}
					trust={trust}
					parentConsistency={parentConsistency}
				/>

				{/* 3. Aspect Scores (5 round gauges) */}
				<AspectScoreGrid aspects={aspects} />

				{/* 4. Behaviour Heatmap (DBS Calendar) */}
				<HeatmapCalendar
					data={heatmapData}
					year={heatmapYear}
					month={heatmapMonth}
					onPrevMonth={prevMonth}
					onNextMonth={nextMonth}
				/>

				{/* 5. Progress Trends (Dual Line Chart) */}
				<ProgressTrendsChart
					data={dualTrend}
					childName={selectedChild.name}
				/>

				{/* 6. Summary Counters (Stat Pills) */}
				<SummaryStats counters={counters} />

				{/* 7. Insights Section (AI Tips, Strengths, Badges) */}
				<InsightsSection
					guidance={guidance}
					strengthsWeaknesses={strengthsWeaknesses}
					badges={badges}
					childName={selectedChild.name}
				/>

				{/* 8. Report Download */}
				<FABReports />
			</ScrollView>
		</SafeAreaView>
	);
};

export default AnalyticsScreen;
