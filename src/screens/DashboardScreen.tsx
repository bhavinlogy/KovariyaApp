import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Button, ProgressCircle } from '../components';
import { colors, spacing, textStyles } from '../theme';
import { Child } from '../types';

const DashboardScreen: React.FC = () => {
  // Mock data - in real app, this would come from API/context
  const currentChild: Child = {
    id: '1',
    name: 'Emma Johnson',
    age: 8,
    dailyScore: 8.5,
    trustMeter: 78,
    confidenceIndicator: 65,
  };

  const weeklyData = [
    { day: 'Mon', score: 7.2 },
    { day: 'Tue', score: 8.1 },
    { day: 'Wed', score: 6.8 },
    { day: 'Thu', score: 8.5 },
    { day: 'Fri', score: 7.9 },
    { day: 'Sat', score: 8.2 },
    { day: 'Sun', score: 8.5 },
  ];

  const aspects = [
    { name: 'Communication', score: 8, color: colors.growth },
    { name: 'Responsibility', score: 7, color: colors.primary },
    { name: 'Kindness', score: 9, color: colors.accent },
    { name: 'Honesty', score: 8, color: colors.growth },
    { name: 'Respect', score: 7, color: colors.primary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.childSelector}>
            <Text style={styles.childName}>{currentChild.name}</Text>
            <Icon name="arrow-drop-down" size={24} color={colors.textSecondary} />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color={colors.textSecondary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Daily Score Card */}
        <Card variant="elevated" style={styles.dailyScoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Today's Score</Text>
            <Text style={styles.scoreValue}>+{currentChild.dailyScore}</Text>
          </View>
          <Text style={styles.scoreChange}>↑ 2.3 from yesterday</Text>
          <ProgressCircle
            size={80}
            progress={((currentChild.dailyScore || 0) / 10) * 100}
            color={colors.growth}
            strokeWidth={8}
          />
        </Card>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <Card variant="elevated" style={styles.metricCard}>
            <Text style={styles.metricTitle}>Trust Meter</Text>
            <ProgressCircle
              size={60}
              progress={currentChild.trustMeter || 0}
              color={colors.primary}
              strokeWidth={6}
            />
            <Text style={styles.metricValue}>{currentChild.trustMeter || 0}%</Text>
          </Card>

          <Card variant="elevated" style={styles.metricCard}>
            <Text style={styles.metricTitle}>Confidence</Text>
            <ProgressCircle
              size={60}
              progress={currentChild.confidenceIndicator || 0}
              color={colors.accent}
              strokeWidth={6}
            />
            <Text style={styles.metricValue}>{currentChild.confidenceIndicator || 0}%</Text>
          </Card>
        </View>

        {/* Weekly Graph */}
        <Card variant="elevated" style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Behaviour</Text>
          <View style={styles.weeklyChart}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View
                  style={[
                    styles.dayBar,
                    {
                      height: `${(day.score / 10) * 100}%`,
                      backgroundColor: day.score >= 8 ? colors.growth : colors.primary,
                    },
                  ]}
                />
                <Text style={styles.dayLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Aspect Breakdown */}
        <Card variant="elevated" style={styles.aspectCard}>
          <Text style={styles.aspectTitle}>Aspect Breakdown</Text>
          {aspects.map((aspect, index) => (
            <View key={index} style={styles.aspectRow}>
              <Text style={styles.aspectName}>{aspect.name}</Text>
              <View style={styles.aspectBarContainer}>
                <View
                  style={[
                    styles.aspectBar,
                    {
                      width: `${(aspect.score / 10) * 100}%`,
                      backgroundColor: aspect.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.aspectScore}>{aspect.score}</Text>
            </View>
          ))}
        </Card>

        {/* AI Guidance Card */}
        <Card variant="elevated" style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Icon name="psychology" size={24} color={colors.primary} />
            <Text style={styles.aiTitle}>AI Guidance</Text>
          </View>
          <Text style={styles.aiMessage}>
            Focus on communication this week. Emma shows great progress in kindness. 
            Try daily check-ins to build trust.
          </Text>
          <Button
            title="View Tips"
            variant="outline"
            size="small"
            onPress={() => console.log('View AI tips')}
          />
        </Card>

        {/* Announcements */}
        <Card variant="elevated" style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>Announcements</Text>
          <View style={styles.announcementItem}>
            <Icon name="event" size={20} color={colors.primary} />
            <Text style={styles.announcementText}>
              Parent-Teacher meeting scheduled for next Tuesday
            </Text>
          </View>
          <View style={styles.announcementItem}>
            <Icon name="emoji-events" size={20} color={colors.accent} />
            <Text style={styles.announcementText}>
              Emma earned "Kindness Champion" badge this week!
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  childSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childName: {
    ...textStyles.headingMedium,
    marginRight: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  dailyScoreCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scoreTitle: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    ...textStyles.headingLarge,
    color: colors.growth,
  },
  scoreChange: {
    ...textStyles.caption,
    color: colors.growth,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  metricTitle: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dayBar: {
    width: 20,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  dayLabel: {
    ...textStyles.caption,
    textAlign: 'center',
  },
  aspectCard: {
    marginBottom: spacing.lg,
  },
  aspectTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  aspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aspectName: {
    ...textStyles.bodyMedium,
    flex: 1,
    marginRight: spacing.sm,
  },
  aspectBarContainer: {
    flex: 2,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  aspectBar: {
    height: '100%',
    borderRadius: 4,
  },
  aspectScore: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
    width: 20,
    textAlign: 'right',
  },
  aiCard: {
    marginBottom: spacing.lg,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiTitle: {
    ...textStyles.headingMedium,
    marginLeft: spacing.sm,
  },
  aiMessage: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  announcementCard: {
    marginBottom: spacing.xl,
  },
  announcementTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  announcementText: {
    ...textStyles.bodyMedium,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default DashboardScreen;
