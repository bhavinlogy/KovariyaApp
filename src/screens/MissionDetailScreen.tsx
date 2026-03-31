import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../components';
import { borderRadius, colors, spacing, textStyles } from '../theme';
import {
  formatMissionStatusLabel,
  formatMissionTypeLabel,
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

function getHistoryColor(status: 'done' | 'missed'): string {
  return status === 'done' ? colors.growth : colors.error;
}

function getHistoryLabel(status: 'done' | 'missed'): string {
  return status === 'done' ? 'Done' : 'Missed';
}

export default function MissionDetailScreen({ route }: Props) {
  const { mission } = route.params;

  const doneCount = useMemo(
    () => mission.completionHistory.filter((entry) => entry.status === 'done').length,
    [mission.completionHistory]
  );

  const timelineEntries = useMemo(
    () =>
      mission.timeline.map((item) => {
        if (typeof item === 'string') {
          return {
            label: item,
            dateTime: '',
          };
        }
        const entry = item as MentorMissionTimelineEntry;
        return {
          label: entry.label ?? '',
          dateTime: entry.dateTime ?? '',
        };
      }),
    [mission.timeline]
  );

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.title}>{mission.title}</Text>
          <Text style={styles.description}>{mission.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaValue}>{formatMissionTypeLabel(mission.missionType)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Start Date</Text>
            <Text style={styles.metaValue}>{mission.startDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>End Date</Text>
            <Text style={styles.metaValue}>{mission.endDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{formatMissionStatusLabel(mission.status)}</Text>
          </View>
        </Card>

        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {timelineEntries.map((step, idx) => (
            <View key={`${mission.id}-timeline-${idx}`} style={styles.timelineRow}>
              <View style={styles.timelineDotWrap}>
                <View style={styles.timelineDot} />
                {idx < timelineEntries.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <View style={styles.timelineMain}>
                <Text style={styles.timelineText}>{step.label}</Text>
                {step.dateTime ? (
                  <Text style={styles.timelineDateTime}>{step.dateTime}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </Card>

        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Completion History</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              Completed {doneCount}/{mission.completionHistory.length} checkpoints
            </Text>
            <Text style={styles.summaryPct}>{mission.progressPercent}%</Text>
          </View>
          {mission.completionHistory.map((entry, idx) => (
            <View key={`${mission.id}-history-${idx}`} style={styles.historyRow}>
              <View style={[styles.historyBadge, { backgroundColor: getHistoryColor(entry.status) }]}>
                <Icon
                  name={entry.status === 'done' ? 'check' : 'close'}
                  size={14}
                  color={colors.surface}
                />
              </View>
              <View style={styles.historyMain}>
                <Text style={styles.historyDate}>{entry.date}</Text>
                <Text style={styles.historyStatus}>{getHistoryLabel(entry.status)}</Text>
                {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
              </View>
            </View>
          ))}
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginVertical: spacing.xs,
  },
  title: {
    ...textStyles.headingMedium,
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  description: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  metaLabel: {
    ...textStyles.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    ...textStyles.bodyMedium,
    fontWeight: '700',
    color: colors.ink,
  },
  sectionTitle: {
    ...textStyles.headingMedium,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: 44,
  },
  timelineDotWrap: {
    width: 18,
    alignItems: 'center',
  },
  timelineDot: {
    marginTop: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.lavender,
    marginTop: 4,
    minHeight: 30,
  },
  timelineText: {
    ...textStyles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timelineMain: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  timelineDateTime: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
  },
  summaryPct: {
    ...textStyles.headingMedium,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  historyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.medium,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  historyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  historyMain: {
    flex: 1,
  },
  historyDate: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  historyStatus: {
    ...textStyles.bodyMedium,
    color: colors.ink,
    fontWeight: '700',
  },
  historyNote: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
