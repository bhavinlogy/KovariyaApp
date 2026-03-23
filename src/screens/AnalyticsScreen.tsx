import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Button } from '../components';
import { colors, spacing, textStyles } from '../theme';
import { AnalyticsData } from '../types';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  // Mock analytics data
  const analyticsData: AnalyticsData = {
    weeklyTrends: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Positive',
          data: [7.2, 8.1, 6.8, 8.5, 7.9, 8.2, 8.5],
          color: colors.growth,
        },
        {
          label: 'Needs Work',
          data: [2.8, 1.9, 3.2, 1.5, 2.1, 1.8, 1.5],
          color: colors.error,
        },
      ],
    },
    behaviourBreakdown: [
      { aspect: 'Communication', score: 8, change: 1.2 },
      { aspect: 'Responsibility', score: 7, change: -0.5 },
      { aspect: 'Kindness', score: 9, change: 2.1 },
      { aspect: 'Honesty', score: 8, change: 0.8 },
      { aspect: 'Respect', score: 7, change: -0.3 },
    ],
    scoreComparison: {
      current: 8.5,
      previous: 7.8,
      average: 7.2,
    },
    goalProgress: {
      completed: 8,
      total: 12,
      onTrack: true,
    },
  };

  const renderWeeklyTrends = () => (
    <Card variant="elevated" style={styles.chartCard}>
      <Text style={styles.chartTitle}>Weekly Trends</Text>
      <View style={styles.chartContainer}>
        {analyticsData.weeklyTrends.labels.map((label, index) => (
          <View key={index} style={styles.dayColumn}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(analyticsData.weeklyTrends.datasets[0].data[index] / 10) * 100}%`,
                    backgroundColor: colors.growth,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(analyticsData.weeklyTrends.datasets[1].data[index] / 10) * 100}%`,
                    backgroundColor: colors.error,
                  },
                ]}
              />
            </View>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.growth }]} />
          <Text style={styles.legendText}>Positive</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Needs Work</Text>
        </View>
      </View>
    </Card>
  );

  const renderBehaviourBreakdown = () => (
    <Card variant="elevated" style={styles.breakdownCard}>
      <Text style={styles.breakdownTitle}>Behaviour Breakdown</Text>
      {analyticsData.behaviourBreakdown.map((item, index) => (
        <View key={index} style={styles.breakdownRow}>
          <Text style={styles.breakdownAspect}>{item.aspect}</Text>
          <View style={styles.breakdownBars}>
            <View style={styles.scoreBarContainer}>
              <View
                style={[
                  styles.scoreBar,
                  {
                    width: `${(item.score / 10) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownScore}>{item.score}</Text>
          </View>
          <View style={styles.changeContainer}>
            <Icon
              name={item.change > 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={item.change > 0 ? colors.growth : colors.error}
            />
            <Text
              style={[
                styles.changeText,
                { color: item.change > 0 ? colors.growth : colors.error },
              ]}
            >
              {Math.abs(item.change)}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );

  const renderScoreComparison = () => (
    <Card variant="elevated" style={styles.comparisonCard}>
      <Text style={styles.comparisonTitle}>Score Comparison</Text>
      <View style={styles.comparisonMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Current</Text>
          <Text style={styles.metricValue}>{analyticsData.scoreComparison.current}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Previous</Text>
          <Text style={styles.metricValue}>{analyticsData.scoreComparison.previous}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Average</Text>
          <Text style={styles.metricValue}>{analyticsData.scoreComparison.average}</Text>
        </View>
      </View>
    </Card>
  );

  const renderGoalProgress = () => (
    <Card variant="elevated" style={styles.progressCard}>
      <Text style={styles.progressTitle}>Goal Progress</Text>
      <View style={styles.progressContent}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressNumber}>
            {analyticsData.goalProgress.completed}/{analyticsData.goalProgress.total}
          </Text>
          <Text style={styles.progressLabel}>Completed</Text>
        </View>
        <View style={styles.progressDetails}>
          <Text style={styles.progressPercentage}>
            {Math.round((analyticsData.goalProgress.completed / analyticsData.goalProgress.total) * 100)}%
          </Text>
          <Text style={styles.progressStatus}>
            {analyticsData.goalProgress.onTrack ? 'On Track' : 'Behind Schedule'}
          </Text>
          <Button
            title="View All Goals"
            variant="outline"
            size="small"
            onPress={() => console.log('View goals')}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Range Selector */}
        <Card variant="elevated" style={styles.dateCard}>
          <TouchableOpacity style={styles.dateSelector}>
            <Text style={styles.dateText}>Last 7 Days</Text>
            <Icon name="arrow-drop-down" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Weekly Trends Chart */}
        {renderWeeklyTrends()}

        {/* Behaviour Breakdown */}
        {renderBehaviourBreakdown()}

        {/* Score Comparison */}
        {renderScoreComparison()}

        {/* Goal Progress */}
        {renderGoalProgress()}

        {/* Export Options */}
        <Card variant="elevated" style={styles.exportCard}>
          <Text style={styles.exportTitle}>Export Data</Text>
          <View style={styles.exportOptions}>
            <Button
              title="PDF Report"
              variant="outline"
              size="small"
              onPress={() => console.log('Export PDF')}
            />
            <Button
              title="Share Data"
              variant="outline"
              size="small"
              onPress={() => console.log('Share data')}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  dateCard: {
    marginBottom: spacing.lg,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
  },
  dateText: {
    ...textStyles.bodyMedium,
    fontWeight: '500',
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: spacing.md,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  bar: {
    width: 12,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  dayLabel: {
    ...textStyles.caption,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: spacing.xs,
  },
  legendText: {
    ...textStyles.caption,
  },
  breakdownCard: {
    marginBottom: spacing.lg,
  },
  breakdownTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  breakdownAspect: {
    ...textStyles.bodyMedium,
    flex: 1,
    marginRight: spacing.sm,
  },
  breakdownBars: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  scoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownScore: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
    width: 20,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
  },
  changeText: {
    ...textStyles.caption,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  comparisonCard: {
    marginBottom: spacing.lg,
  },
  comparisonTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  comparisonMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    ...textStyles.caption,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...textStyles.headingLarge,
    color: colors.primary,
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.growth,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  progressNumber: {
    ...textStyles.headingMedium,
    color: colors.growth,
  },
  progressLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  progressDetails: {
    flex: 1,
  },
  progressPercentage: {
    ...textStyles.headingLarge,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  progressStatus: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.md,
  },
  exportCard: {
    marginBottom: spacing.xl,
  },
  exportTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  exportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default AnalyticsScreen;
