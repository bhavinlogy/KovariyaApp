import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Button, ProgressCircle } from '../components';
import {
  colors,
  spacing,
  textStyles,
  borderRadius,
  getFloatingTabBarBottomPadding,
} from '../theme';
import { Child } from '../types';

const PARENT_FIRST_NAME = 'Sarah';

const MOCK_CHILD: Child = {
  id: '1',
  name: 'Emma',
  age: 8,
  dailyScore: 8.5,
  trustMeter: 78,
  confidenceIndicator: 65,
};

const WEEK_STRIP = [
  { id: 'mon', label: 'Mon', short: 'M', score: 7.2 },
  { id: 'tue', label: 'Tue', short: 'T', score: 8.1 },
  { id: 'wed', label: 'Wed', short: 'W', score: 6.8 },
  { id: 'thu', label: 'Thu', short: 'T', score: 8.5 },
  { id: 'fri', label: 'Fri', short: 'F', score: 7.9 },
  { id: 'sat', label: 'Sat', short: 'S', score: 8.2 },
  { id: 'sun', label: 'Sun', short: 'S', score: 8.5 },
] as const;

const ASPECTS = [
  { id: 'comm', name: 'Communication', score: 8, tone: colors.sky },
  { id: 'resp', name: 'Responsibility', score: 7, tone: colors.peachSoft },
  { id: 'kind', name: 'Kindness', score: 9, tone: colors.mintSoft },
  { id: 'hones', name: 'Honesty', score: 8, tone: colors.lavenderSoft },
  { id: 'resp2', name: 'Respect', score: 7, tone: colors.skySoft },
] as const;

const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );
  const [selectedDayId, setSelectedDayId] = useState<string>('thu');

  const handleViewTips = useCallback(() => {
    // Open tips modal / screen when wired
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar} accessibilityLabel="Your profile">
              <Text style={styles.avatarText}>{PARENT_FIRST_NAME.slice(0, 1)}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {PARENT_FIRST_NAME}</Text>
              <View style={styles.childRow}>
                <Text style={styles.childName}>{MOCK_CHILD.name}</Text>
                <Text style={styles.childMeta}> · Age {MOCK_CHILD.age}</Text>
                <Icon name="arrow-drop-down" size={22} color={colors.textSecondary} />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Icon name="notifications-none" size={26} color={colors.ink} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroEyebrow}>Today's gentle focus</Text>
                <Text style={styles.heroTitle}>Keep the streak kind</Text>
                <Text style={styles.heroSubtitle}>
                  A calm 2-minute check-in beats a long lecture. You've got this.
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>+{MOCK_CHILD.dailyScore}</Text>
                <Text style={styles.heroBadgeCaption}>today</Text>
              </View>
            </View>
            <View style={styles.heroFooter}>
              <ProgressCircle
                size={88}
                progress={(MOCK_CHILD.dailyScore! / 10) * 100}
                color={colors.ink}
                backgroundColor="rgba(255,255,255,0.35)"
                strokeWidth={7}
              />
              <View style={styles.heroCopy}>
                <Text style={styles.heroHint}>
                  Trust is built in small moments — try one appreciative sentence before bed.
                </Text>
                <Button title="See ideas" variant="outline" size="small" onPress={handleViewTips} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>This week</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekStrip}
          >
            {WEEK_STRIP.map((d) => {
              const selected = d.id === selectedDayId;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => setSelectedDayId(d.id)}
                  style={[styles.dayPill, selected && styles.dayPillSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${d.label}`}
                >
                  <Text style={[styles.dayPillLabel, selected && styles.dayPillLabelSelected]}>
                    {d.short}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionTight}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.lg }]}>How {MOCK_CHILD.name} is doing</Text>
          <View style={styles.metricsRow}>
            <View style={[styles.metricTile, { backgroundColor: colors.skySoft }]}>
              <Text style={styles.metricLabel}>Trust</Text>
              <ProgressCircle
                size={56}
                progress={MOCK_CHILD.trustMeter!}
                color={colors.ink}
                strokeWidth={5}
                backgroundColor="rgba(255,255,255,0.7)"
              />
              {/* <Text style={styles.metricValue}>{MOCK_CHILD.trustMeter}%</Text> */}
            </View>
            <View style={[styles.metricTile, { backgroundColor: colors.peachSoft }]}>
              <Text style={styles.metricLabel}>Confidence</Text>
              <ProgressCircle
                size={56}
                progress={MOCK_CHILD.confidenceIndicator!}
                color={colors.ink}
                strokeWidth={5}
                backgroundColor="rgba(255,255,255,0.7)"
              />
              {/* <Text style={styles.metricValue}>{MOCK_CHILD.confidenceIndicator}%</Text> */}
            </View>
          </View>
        </View>

        <View style={styles.sectionTight}>
          <Card variant="elevated" style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Weekly rhythm</Text>
            <View style={styles.weeklyChart}>
              {WEEK_STRIP.map((day) => (
                <View key={day.id} style={styles.dayColumn}>
                  <View
                    style={[
                      styles.dayBar,
                      {
                        height: `${(day.score / 10) * 100}%`,
                        backgroundColor:
                          day.score >= 8 ? colors.mint : colors.lavender,
                      },
                    ]}
                  />
                  <Text style={styles.dayLabel}>{day.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={styles.sectionTight}>
          <Card>
            <Text style={styles.sectionTitle}>Strength snapshot</Text>
            {ASPECTS.map((aspect) => (
              <View key={aspect.id} style={styles.aspectRow}>
                <View style={[styles.aspectDot, { backgroundColor: aspect.tone }]} />
                <Text style={styles.aspectName}>{aspect.name}</Text>
                <View style={styles.aspectBarContainer}>
                  <View
                    style={[
                      styles.aspectBar,
                      {
                        width: `${(aspect.score / 10) * 100}%`,
                        backgroundColor: colors.ink,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.aspectScore}>{aspect.score}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.sectionTight}>
          <Card style={styles.coachCard}>
            <View style={styles.coachHeader}>
              <View style={styles.coachIcon}>
                <Icon name="spa" size={22} color={colors.ink} />
              </View>
              <Text style={styles.sectionTitle}>Coach note</Text>
            </View>
            <Text style={styles.coachBody}>
              Emma is glowing in kindness. If energy dips mid-week, try a shared walk before homework — it
              resets the room without pressure.
            </Text>
            <Button title="Open guidance" variant="secondary" size="small" onPress={handleViewTips} />
          </Card>
        </View>

        <View style={styles.sectionTight}>
          <Card>
            <Text style={styles.sectionTitle}>Updates</Text>
            <View style={styles.announcementItem}>
              <View style={styles.bullet} />
              <Text style={styles.announcementText}>
                Parent–teacher chat is scheduled for Tuesday — want a reminder the evening before?
              </Text>
            </View>
            <View style={styles.announcementItem}>
              <View style={[styles.bullet, { backgroundColor: colors.mint }]} />
              <Text style={styles.announcementText}>
                Emma earned a kindness highlight this week. Tap Goals to celebrate together.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  greeting: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  childName: {
    ...textStyles.headingMedium,
    fontSize: 20,
  },
  childMeta: {
    ...textStyles.bodyMedium,
    color: colors.textMuted,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.lavenderSoft,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(124, 106, 232, 0.18)',
  },
  heroTop: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroEyebrow: {
    ...textStyles.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    ...textStyles.hero,
    fontSize: 26,
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    ...textStyles.bodyLarge,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  heroBadge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  heroBadgeText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  heroBadgeCaption: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
  },
  heroHint: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTight: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...textStyles.caption,
    fontWeight: '600',
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekStrip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dayPill: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dayPillSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  dayPillLabel: {
    fontWeight: '700',
    color: colors.ink,
    fontSize: 14,
  },
  dayPillLabelSelected: {
    color: colors.surface,
  },
  sectionTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  metricTile: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingBottom: spacing.lg,
  },
  metricLabel: {
    ...textStyles.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...textStyles.bodyLarge,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
  },
  weeklyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayBar: {
    width: 16,
    borderRadius: borderRadius.small,
    marginBottom: spacing.xs,
  },
  dayLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  aspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aspectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  aspectName: {
    flex: 1,
    ...textStyles.bodyLarge,
    fontSize: 15,
  },
  aspectBarContainer: {
    flex: 2,
    height: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  aspectBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  aspectScore: {
    width: 28,
    textAlign: 'right',
    fontWeight: '700',
    color: colors.ink,
  },
  coachCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.mintSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63, 169, 122, 0.2)',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  coachIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  coachBody: {
    ...textStyles.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lavender,
    marginTop: 7,
    marginRight: spacing.sm,
  },
  announcementText: {
    ...textStyles.bodyLarge,
    flex: 1,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
