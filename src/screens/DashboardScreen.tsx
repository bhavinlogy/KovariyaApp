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
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Card, Button, ProgressCircle } from '../components';
import {
  colors,
  spacing,
  textStyles,
  borderRadius,
  getFloatingTabBarBottomPadding,
} from '../theme';
import { AIGuidance, Child } from '../types';

const PARENT_FIRST_NAME = 'Sarah';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function getTrustMeta(score: number) {
  const s = clamp(score, 0, 100);
  if (s >= 80) {
    return {
      level: 'High' as const,
      color: colors.growth,
      pillBg: colors.growthLight,
      pillBorder: 'rgba(63, 169, 122, 0.28)',
      ringBgHint: colors.mintSoft,
    };
  }
  if (s >= 50) {
    return {
      level: 'Medium' as const,
      color: colors.primary,
      pillBg: colors.primaryLight,
      pillBorder: 'rgba(124, 106, 232, 0.24)',
      ringBgHint: colors.lavenderSoft,
    };
  }
  return {
    level: 'Low' as const,
    color: colors.error,
    pillBg: 'rgba(232, 93, 93, 0.10)',
    pillBorder: 'rgba(232, 93, 93, 0.24)',
    ringBgHint: colors.peachSoft,
  };
}

const MOCK_CHILD: Child = {
  id: '1',
  name: 'Emma',
  age: 8,
  dailyScore: 8.5,
  trustMeter: 78,
  confidenceIndicator: 65,
};

const MOCK_FAMILY_SCORE = 84; // 0-100 (percentage)
const MOCK_AI_GUIDANCE: AIGuidance = {
  id: 'ai-1',
  title: 'AI Guidance',
  message:
    'Today looks steady. For the quickest improvement: try one kind “why” question during homework, then end with a 30-second celebration.',
  type: 'tip',
  priority: 'high',
};

const WEEK_STRIP = [
  { id: 'mon', label: 'Mon', short: 'M', score: 7.2 },
  { id: 'tue', label: 'Tue', short: 'Tu', score: 8.1 },
  { id: 'wed', label: 'Wed', short: 'W', score: 6.8 },
  { id: 'thu', label: 'Thu', short: 'Th', score: 8.5 },
  { id: 'fri', label: 'Fri', short: 'F', score: 7.9 },
  { id: 'sat', label: 'Sat', short: 'Sa', score: 8.2 },
  { id: 'sun', label: 'Sun', short: 'Su', score: 8.5 },
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

  const handleViewGuidance = useCallback(() => {
    // Wire to guidance screen/modal when your backend is connected.
  }, []);

  const selectedDay = useMemo(() => WEEK_STRIP.find((d) => d.id === selectedDayId) ?? WEEK_STRIP[0], [
    selectedDayId,
  ]);

  const trustScore = clamp(MOCK_CHILD.trustMeter ?? 0, 0, 100);
  const trustMeta = useMemo(() => getTrustMeta(trustScore), [trustScore]);

  // Confidence Factor (CF) is provided as percent (0-100) on this screen.
  // Your scoring system: CF = max(0.4, min(1, N/3)).
  const confidencePercent = clamp(MOCK_CHILD.confidenceIndicator ?? 0, 0, 100);
  const confidenceCF = confidencePercent / 100;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <View style={styles.hero}>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroTopLeft}>
                  <Text style={styles.heroEyebrow}>Student Daily Score (SDS)</Text>
                  <Text style={styles.heroTitle}>
                    {MOCK_CHILD.dailyScore?.toFixed(1)} / 10
                  </Text>
                  <Text style={styles.heroSubtitle}>
                    A quick snapshot of progress and tone. Small, steady moments build confidence.
                  </Text>
                </View>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>+{MOCK_CHILD.dailyScore}</Text>
                  <Text style={styles.heroBadgeCaption}>today</Text>
                </View>
              </View>
              <View style={styles.heroFooter}>
                <View style={styles.ringWrap}>
                  <ProgressCircle
                    size={88}
                    progress={(MOCK_CHILD.dailyScore! / 10) * 100}
                    color={colors.ink}
                    backgroundColor="rgba(255,255,255,0.35)"
                    strokeWidth={7}
                    showPercentage={false}
                  />
                  <View style={styles.ringCenter}>
                    <Text style={styles.ringCenterValue}>{MOCK_CHILD.dailyScore?.toFixed(1)}</Text>
                    <Text style={styles.ringCenterUnit}>SDS</Text>
                  </View>
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroHint}>
                    Focus on kindness first: one supportive sentence before homework makes a difference.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <View style={styles.sectionTight}>
            <View style={[styles.metricStackTile, { backgroundColor: trustMeta.pillBg }]}>
              <View style={styles.metricTitleRow}>
                <View style={styles.metricTitleLeft}>
                  <Icon name="verified-user" size={18} color={trustMeta.color} />
                  <Text style={styles.metricLabel}>Trust Meter</Text>
                </View>
                <View
                  style={[
                    styles.trustPill,
                    {
                      backgroundColor: trustMeta.pillBg,
                      borderColor: trustMeta.pillBorder,
                    },
                  ]}
                >
                  <Text style={[styles.trustPillText, { color: trustMeta.color }]}>{trustMeta.level}</Text>
                </View>
              </View>

              <View style={styles.ringWrapSmall}>
                <ProgressCircle
                  size={68}
                  progress={trustScore}
                  color={trustMeta.color}
                  strokeWidth={6}
                  backgroundColor="rgba(255,255,255,0.7)"
                  showPercentage={false}
                />
                <View style={styles.ringCenterSmall}>
                  <Text style={styles.ringCenterValueSmall}>{Math.round(trustScore)}%</Text>
                </View>
              </View>
              <Text style={styles.metricSubtleText}>Reliability of parent rating behaviour.</Text>

              <View style={styles.factorList}>
                {[
                  'Rating variation',
                  'Balance of positive/negative scores',
                  'Evidence participation',
                  'Spam detection',
                ].map((t) => (
                  <View key={t} style={styles.factorRow}>
                    <Icon
                      name={
                        trustMeta.level === 'High'
                          ? 'check-circle'
                          : trustMeta.level === 'Medium'
                            ? 'help-outline'
                            : 'error-outline'
                      }
                      size={16}
                      color={
                        trustMeta.level === 'High'
                          ? colors.growth
                          : trustMeta.level === 'Medium'
                            ? colors.primary
                            : colors.error
                      }
                      style={styles.factorIcon}
                    />
                    <Text style={styles.factorText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <View style={styles.sectionTight}>
            <View style={[styles.metricStackTile, { backgroundColor: colors.primaryLight }]}>
              <View style={styles.metricTitleRow}>
                <View style={styles.metricTitleLeft}>
                  <Icon name="autorenew" size={18} color={colors.primary} />
                  <Text style={styles.metricLabel}>Confidence indicator</Text>
                </View>
                <View
                  style={[
                    styles.trustPill,
                    { backgroundColor: colors.primaryLight, borderColor: 'rgba(124, 106, 232, 0.28)' },
                  ]}
                >
                  <Text style={[styles.trustPillText, { color: colors.primary }]}>CF {confidenceCF.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.ringWrapSmall}>
                <ProgressCircle
                  size={68}
                  progress={confidencePercent}
                  color={colors.primary}
                  strokeWidth={6}
                  backgroundColor="rgba(255,255,255,0.7)"
                  showPercentage={false}
                />
                <View style={styles.ringCenterSmall}>
                  <Text style={styles.ringCenterValueSmall}>
                    {Math.round(confidencePercent)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.metricSubtleText}>
                CF = max(0.4, min(1, N/3)). Higher N stabilizes confidence.
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <View style={styles.sectionTight}>
            <Card variant="elevated" style={styles.chartCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>Weekly behaviour</Text>
                <Text style={styles.cardHeaderRightText}>{selectedDay.label}</Text>
              </View>

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

              <View style={styles.weeklyChart}>
                {WEEK_STRIP.map((day) => (
                  <WeeklyDayBar key={day.id} day={day} selectedDayId={selectedDayId} />
                ))}
              </View>

              <View style={styles.weeklySummary}>
                <Text style={styles.weeklySummaryText}>
                  {selectedDay.label}: <Text style={styles.weeklySummaryEm}>{selectedDay.score.toFixed(1)}</Text> / 10
                </Text>
              </View>
            </Card>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <View style={styles.sectionTight}>
            <Card variant="elevated" style={styles.aspectCard}>
              <Text style={styles.sectionTitle}>Aspect breakdown chart</Text>
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
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <View style={styles.sectionTight}>
            <Card variant="elevated" style={styles.familyCard}>
              <View style={styles.metricHeaderRow}>
                <View style={[styles.metricIconWrap, { backgroundColor: colors.mintSoft }]}>
                  <Icon name="groups" size={20} color={colors.ink} />
                </View>
                <Text style={styles.sectionTitle}>Family Score (FS)</Text>
              </View>

              <View style={styles.familyRingRow}>
                <View style={styles.familyRingWrap}>
                  <ProgressCircle
                    size={78}
                    progress={MOCK_FAMILY_SCORE}
                    color={colors.ink}
                    strokeWidth={7}
                    backgroundColor="rgba(255,255,255,0.55)"
                    showPercentage={false}
                  />
                  <View style={styles.ringCenterSmall}>
                    <Text style={styles.ringCenterValueSmall}>{MOCK_FAMILY_SCORE}%</Text>
                  </View>
                </View>
                <View style={styles.familyCopy}>
                  <Text style={styles.familyHint}>
                    Overall home harmony from routines, tone, and consistency.
                  </Text>
                  <Text style={styles.familyMiniLabel}>Best next step</Text>
                  <Text style={styles.familyMiniValue}>End with one shared gratitude moment.</Text>
                </View>
              </View>
            </Card>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <View style={styles.sectionTight}>
            <Card style={styles.coachCard}>
              <View style={styles.coachHeader}>
                <View style={styles.coachIcon}>
                  <Icon
                    name={MOCK_AI_GUIDANCE.type === 'warning' ? 'warning' : MOCK_AI_GUIDANCE.type === 'tip' ? 'lightbulb' : 'auto-awesome'}
                    size={22}
                    color={colors.ink}
                  />
                </View>
                <Text style={styles.sectionTitle}>{MOCK_AI_GUIDANCE.title}</Text>
              </View>
              <Text style={styles.coachBody}>{MOCK_AI_GUIDANCE.message}</Text>
              <Button title="Open guidance" variant="secondary" size="small" onPress={handleViewGuidance} />
            </Card>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

function WeeklyDayBar({
  day,
  selectedDayId,
}: {
  day: (typeof WEEK_STRIP)[number];
  selectedDayId: string;
}) {
  const isSelected = day.id === selectedDayId;
  const barScale = useSharedValue(1);

  React.useEffect(() => {
    barScale.value = withTiming(isSelected ? 1.08 : 1, { duration: 220 });
  }, [isSelected, barScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: barScale.value }],
  }));

  return (
    <View style={styles.dayColumn}>
      <Animated.View
        style={[
          styles.dayBar,
          {
            height: `${(day.score / 10) * 100}%`,
            backgroundColor: day.score >= 8 ? colors.mint : colors.lavender,
            opacity: isSelected ? 1 : 0.84,
            borderWidth: isSelected ? 1.5 : 0,
            borderColor: isSelected ? colors.ink : 'transparent',
          },
          animatedStyle,
        ]}
      />
      <Text style={styles.dayLabel}>{day.label}</Text>
    </View>
  );
}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignItems: 'center',
  },
  heroTopLeft: {
    width: '70%'
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
    fontSize: 24,
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
    alignItems: 'center',
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
  ringWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringWrapSmall: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ringCenterSmall: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ringCenterValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 26,
  },
  ringCenterUnit: {
    ...textStyles.caption,
    marginTop: -2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  ringCenterValueSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardHeaderRightText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  weeklySummary: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  weeklySummaryText: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
  },
  weeklySummaryEm: {
    ...textStyles.headingMedium,
    color: colors.ink,
    fontWeight: '700',
  },
  metricStackTile: {
    marginHorizontal: spacing.lg,
    flex: 0,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingBottom: spacing.lg,
  },
  metricSubtleText: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  metricTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trustPill: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  trustPillText: {
    ...textStyles.caption,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  trustLevelText: {
    ...textStyles.caption,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 16,
  },
  factorList: {
    marginTop: spacing.sm,
    width: '100%',
    gap: 6,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  factorIcon: {
    marginRight: 0,
  },
  factorText: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
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
  aspectCard: {
    marginHorizontal: spacing.lg,
  },
  coachCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.mintSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63, 169, 122, 0.2)',
  },
  familyCard: {
    marginHorizontal: spacing.lg,
  },
  familyRingRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  familyRingWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  familyCopy: {
    flex: 1,
  },
  familyHint: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  familyMiniLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  familyMiniValue: {
    ...textStyles.bodyLarge,
    color: colors.ink,
    fontWeight: '600',
    lineHeight: 22,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
