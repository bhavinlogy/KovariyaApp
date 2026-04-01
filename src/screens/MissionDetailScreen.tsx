import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppGradientHeader, Card } from '../components';
import {
  borderRadius,
  colors,
  getFloatingTabBarBottomPadding,
  spacing,
  textStyles,
  typography,
} from '../theme';
import {
  dailyFloatingPalette,
  floatingPillShadow,
  missionTypeChipStyle,
} from '../theme/missionPillStyles';
import {
  formatDailyStatusLabel,
  formatLifecycleStatusLabel,
  formatMissionTypeLabel,
  getDailyStatusForToday,
  resolveLifecycleStatus,
  type MentorMissionTimelineEntry,
  type MentorMission,
} from '../data/mentorMissions';

type Props = {
  route: {
    params: {
      mission: MentorMission;
    };
  };
};

function formatHistoryDate(iso: string): string {
  try {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function MissionDetailScreen({ route }: Props) {
  const { mission } = route.params;
  const insets = useSafeAreaInsets();

  const lifecycle = useMemo(() => resolveLifecycleStatus(mission), [mission]);
  const dailyToday = useMemo(() => getDailyStatusForToday(mission), [mission]);
  const dailyPal = dailyFloatingPalette(dailyToday);
  const typeVisual = missionTypeChipStyle(mission.missionType);

  const doneCount = useMemo(
    () => mission.completionHistory.filter((entry) => entry.status === 'done').length,
    [mission.completionHistory]
  );

  const sortedHistory = useMemo(
    () => [...mission.completionHistory].sort((a, b) => b.date.localeCompare(a.date)),
    [mission.completionHistory]
  );

  const timelineEntries = useMemo(
    () =>
      mission.timeline.map((item) => {
        if (typeof item === 'string') {
          return { label: item, dateTime: '' };
        }
        const entry = item as MentorMissionTimelineEntry;
        return {
          label: entry.label ?? '',
          dateTime: entry.dateTime ?? '',
        };
      }),
    [mission.timeline]
  );

  const scrollBottom = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );

  const headerSubtitle = `${formatMissionTypeLabel(mission.missionType)} · ${formatLifecycleStatusLabel(lifecycle)}`;

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <AppGradientHeader
        leadingMode="back"
        title={mission.title}
        subtitle={headerSubtitle}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" padding={0} style={styles.heroCard}>
          <View style={styles.heroBody}>
            <Text style={styles.heroDescription}>{mission.description}</Text>

            <View style={styles.chipRow}>
              <View style={[styles.typeChip, { backgroundColor: typeVisual.backgroundColor }]}>
                <Text style={[styles.typeChipText, { color: typeVisual.color }]}>
                  {formatMissionTypeLabel(mission.missionType)}
                </Text>
              </View>
              <View
                style={[
                  styles.floatingPill,
                  styles.floatingPillDaily,
                  floatingPillShadow(dailyPal.shadowColor),
                  { backgroundColor: dailyPal.bg },
                ]}
              >
                <Text style={[styles.floatingPillText, { color: dailyPal.text }]}>
                  Today · {formatDailyStatusLabel(dailyToday)}
                </Text>
              </View>
            </View>

            <View style={styles.progressBlock}>
              <View style={styles.progressHead}>
                <Text style={styles.progressLabel}>Overall progress</Text>
                <Text style={styles.progressPct}>{mission.progressPercent}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${mission.progressPercent}%` }]}
                />
              </View>
            </View>

            <View style={styles.dateStrip}>
              <View style={styles.dateStripItem}>
                <Text style={styles.dateStripLabel}>Starts</Text>
                <Text style={styles.dateStripValue}>{mission.startDate}</Text>
              </View>
              <View style={styles.dateStripDivider} />
              <View style={styles.dateStripItem}>
                <Text style={styles.dateStripLabel}>Ends</Text>
                <Text style={styles.dateStripValue}>{mission.endDate}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionIconOrb}>
              <Icon name="schedule" size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.sectionTitle}>Timeline</Text>
          </View>
          <Text style={styles.sectionHint}>Key moments for this mission</Text>
          {timelineEntries.map((step, idx) => {
            const isLast = idx === timelineEntries.length - 1;
            return (
              <View key={`${mission.id}-timeline-${idx}`} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.timelineDot}
                  />
                  {!isLast ? (
                    <LinearGradient
                      colors={['rgba(124, 106, 232, 0.45)', 'rgba(184, 169, 249, 0.2)']}
                      style={[styles.timelineLine, { minHeight: 36 }]}
                    />
                  ) : null}
                </View>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineTitle}>{step.label}</Text>
                  {step.dateTime ? (
                    <View style={styles.timelineWhenRow}>
                      <Icon name="schedule" size={14} color={colors.textMuted} />
                      <Text style={styles.timelineWhen}>{step.dateTime}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </Card>

        <Card variant="elevated" padding={0} style={styles.historyCard}>
          <LinearGradient
            colors={[colors.mintSoft, 'rgba(255,255,255,0.96)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.historyHero}
          >
            <View style={styles.historyHeroText}>
              <Text style={styles.historyHeroLabel}>Check-ins</Text>
              <Text style={styles.historyHeroSub}>
                {doneCount} successful · {mission.completionHistory.length} logged
              </Text>
            </View>
            <View style={styles.historyPctRing}>
              <Text style={styles.historyPctValue}>
                {mission.progressPercent}
                <Text style={styles.historyPctSuffix}>%</Text>
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.historyListHead}>
            <Icon name="calendar-month" size={20} color={colors.primaryDark} />
            <Text style={styles.historyListTitle}>Daily log</Text>
            <View style={styles.historyCountPill}>
              <Text style={styles.historyCountText}>{sortedHistory.length}</Text>
            </View>
          </View>

          <View style={styles.groupedSheet}>
            {sortedHistory.map((entry, idx) => {
              const isDone = entry.status === 'done';
              const isLast = idx === sortedHistory.length - 1;
              return (
                <View
                  key={`${mission.id}-history-${entry.date}-${idx}`}
                  style={[styles.sheetRow, !isLast && styles.sheetRowDivider]}
                >
                  <View
                    style={[
                      styles.sheetStatusOrb,
                      { backgroundColor: isDone ? colors.growth : colors.error },
                    ]}
                  >
                    <Icon
                      name={isDone ? 'check' : 'close'}
                      size={16}
                      color={colors.surface}
                    />
                  </View>
                  <View style={styles.sheetMain}>
                    <Text style={styles.sheetDate}>{formatHistoryDate(entry.date)}</Text>
                    <View style={styles.sheetMetaRow}>
                      <View
                        style={[
                          styles.sheetMiniPill,
                          { backgroundColor: isDone ? colors.mintSoft : '#FFE8E8' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sheetMiniPillText,
                            { color: isDone ? colors.growth : colors.error },
                          ]}
                        >
                          {isDone ? 'Done' : 'Missed'}
                        </Text>
                      </View>
                    </View>
                    {entry.note ? <Text style={styles.sheetNote}>{entry.note}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  heroCard: {
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  heroBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  heroDescription: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  typeChip: {
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  typeChipText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
  floatingPill: {
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexShrink: 0,
  },
  floatingPillDaily: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  floatingPillText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  progressBlock: {
    marginTop: spacing.lg,
  },
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  progressPct: {
    ...textStyles.bodyLarge,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  dateStrip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dateStripItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateStripLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateStripValue: {
    ...textStyles.bodyMedium,
    color: colors.ink,
    fontWeight: '700',
  },
  dateStripDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  sectionCard: {
    marginVertical: spacing.xs,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionIconOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...textStyles.headingMedium,
    fontWeight: '800',
    color: colors.ink,
  },
  sectionHint: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timelineRail: {
    width: 22,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
  },
  timelineLine: {
    width: 3,
    marginTop: 4,
    borderRadius: 2,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.large,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(124, 106, 232, 0.12)',
  },
  timelineTitle: {
    ...textStyles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    lineHeight: 22,
  },
  timelineWhenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  timelineWhen: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  historyCard: {
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  historyHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(63, 169, 122, 0.15)',
  },
  historyHeroText: {
    flex: 1,
    minWidth: 0,
  },
  historyHeroLabel: {
    ...textStyles.bodyLarge,
    fontWeight: '800',
    color: colors.growth,
  },
  historyHeroSub: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  historyPctRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'rgba(63, 169, 122, 0.35)',
  },
  historyPctValue: {
    ...textStyles.headingMedium,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  historyPctSuffix: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  historyListHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  historyListTitle: {
    ...textStyles.bodyLarge,
    fontWeight: '800',
    color: colors.ink,
    flex: 1,
  },
  historyCountPill: {
    backgroundColor: colors.lavenderSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  historyCountText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  groupedSheet: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  sheetRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetStatusOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sheetMain: {
    flex: 1,
    minWidth: 0,
  },
  sheetDate: {
    ...textStyles.bodyMedium,
    fontWeight: '700',
    color: colors.ink,
  },
  sheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sheetMiniPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  sheetMiniPillText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  sheetNote: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
});
