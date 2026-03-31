import React, { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card } from '../components';
import { useToast } from '../context/ToastContext';
import { getFloatingTabBarBottomPadding, borderRadius, colors, spacing, textStyles, typography } from '../theme';
import {
  MENTOR_ASSIGNED_MISSIONS,
  formatMissionStatusLabel,
  formatMissionTypeLabel,
  type MentorMission,
} from '../data/mentorMissions';

type Props = {
  navigation: {
    navigate: (screen: string, params?: unknown) => void;
  };
};

function missionTypeChipStyle(type: MentorMission['missionType']) {
  return type === 'daily-habit'
    ? { backgroundColor: colors.lavenderSoft, color: colors.primaryDark }
    : { backgroundColor: colors.peachSoft, color: '#9A5D14' };
}

function statusTone(status: MentorMission['status']) {
  switch (status) {
    case 'completed':
      return { bg: colors.mintSoft, text: colors.growth };
    case 'missed':
      return { bg: '#FFF1F1', text: colors.error };
    case 'in-progress':
      return { bg: colors.lavenderSoft, text: colors.primaryDark };
    default:
      return { bg: colors.surfaceMuted, text: colors.textSecondary };
  }
}

export default function MissionsScreen({ navigation }: Props) {
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [missionState, setMissionState] = useState<Record<string, MentorMission>>(Object.fromEntries(
    MENTOR_ASSIGNED_MISSIONS.map((m) => [m.id, m])
  ));

  const missions = useMemo(() => Object.values(missionState), [missionState]);
  const bottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );

  const markDone = useCallback(
    (mission: MentorMission) => {
      setMissionState((prev) => {
        const current = prev[mission.id];
        if (!current) {
          return prev;
        }
        const nextProgress = Math.min(100, current.progressPercent + 7);
        return {
          ...prev,
          [mission.id]: {
            ...current,
            progressPercent: nextProgress,
            status: nextProgress >= 100 ? 'completed' : 'in-progress',
            completionHistory: [
              { date: new Date().toISOString().slice(0, 10), status: 'done' },
              ...current.completionHistory,
            ],
          },
        };
      });
      showToast({
        type: 'success',
        message: `${mission.title}: marked Done Today`,
      });
    },
    [showToast]
  );

  const markMissed = useCallback(
    (mission: MentorMission) => {
      setMissionState((prev) => {
        const current = prev[mission.id];
        if (!current) {
          return prev;
        }
        const nextProgress = Math.max(0, current.progressPercent - 5);
        return {
          ...prev,
          [mission.id]: {
            ...current,
            progressPercent: nextProgress,
            status: 'missed',
            completionHistory: [
              { date: new Date().toISOString().slice(0, 10), status: 'missed' },
              ...current.completionHistory,
            ],
          },
        };
      });
      showToast({
        type: 'info',
        message: `${mission.title}: marked Missed Today`,
      });
    },
    [showToast]
  );

  const uploadProof = useCallback(
    (mission: MentorMission) => {
      showToast({
        type: 'info',
        message: `Upload flow for "${mission.title}" will be connected next.`,
      });
    },
    [showToast]
  );

  const openDetails = useCallback(
    (mission: MentorMission) => {
      navigation.navigate('MissionDetail', { mission });
    },
    [navigation]
  );

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.866 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.headerOrbLg} />
        <View style={styles.headerOrbSm} />
        <Text style={styles.headerTitle}>Missions</Text>
        <Text style={styles.headerSubtitle}>Assigned by your mentor</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {missions.map((mission) => {
          const typeVisual = missionTypeChipStyle(mission.missionType);
          const statusVisual = statusTone(mission.status);
          return (
            <Card key={mission.id} variant="elevated" style={styles.card}>
              <Pressable
                onPress={() => openDetails(mission)}
                style={({ pressed }) => [pressed && styles.cardPressed]}
                accessibilityRole="button"
                accessibilityLabel={`${mission.title}. Open mission details.`}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{mission.title}</Text>
                  <Icon name="chevron-right" size={22} color={colors.textMuted} />
                </View>
                <Text style={styles.cardDesc}>{mission.description}</Text>

                <View style={styles.badgeRow}>
                  <View style={[styles.chip, { backgroundColor: typeVisual.backgroundColor }]}>
                    <Text style={[styles.chipText, { color: typeVisual.color }]}>
                      {formatMissionTypeLabel(mission.missionType)}
                    </Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: statusVisual.bg }]}>
                    <Text style={[styles.chipText, { color: statusVisual.text }]}>
                      {formatMissionStatusLabel(mission.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>Start: {mission.startDate}</Text>
                  <Text style={styles.dateText}>End: {mission.endDate}</Text>
                </View>

                <View style={styles.progressWrap}>
                  <View style={styles.progressHead}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPct}>{mission.progressPercent}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${mission.progressPercent}%` }]} />
                  </View>
                </View>
              </Pressable>

              <View style={styles.actionsRow}>
                <View style={styles.actionButtonCol}>
                  <Button
                    title="Done"
                    size="small"
                    variant="primary"
                    icon={<Icon name="check-circle" size={18} color={colors.surface} />}
                    onPress={() => markDone(mission)}
                    style={StyleSheet.flatten([
                      styles.missionButtonDone,
                      {
                        backgroundColor: colors.growth,
                        minHeight: 38,
                        paddingVertical: 8,
                      },
                    ])}
                  />
                </View>
                <View style={styles.actionButtonCol}>
                  <Button
                    title="Missed"
                    size="small"
                    variant="primary"
                    icon={<Icon name="highlight-off" size={18} color={colors.surface} />}
                    onPress={() => markMissed(mission)}
                    style={StyleSheet.flatten([
                      styles.missionButtonMissed,
                      {
                        backgroundColor: colors.error,
                        minHeight: 38,
                        paddingVertical: 8,
                      },
                    ])}
                  />
                </View>
              </View>

              {mission.missionType === 'activity-based' ? (
                <Button
                  title="Upload Proof"
                  size="small"
                  variant="primary"
                  onPress={() => uploadProof(mission)}
                  style={styles.uploadBtn}
                />
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  headerOrbLg: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -90,
    right: -40,
  },
  headerOrbSm: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    left: 24,
    bottom: 10,
  },
  headerTitle: {
    ...textStyles.headingLarge,
    color: colors.surface,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...textStyles.bodyMedium,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    marginVertical: spacing.xs,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    ...textStyles.headingMedium,
    flex: 1,
    color: colors.ink,
    fontWeight: '800',
  },
  cardDesc: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chip: {
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    // backgroundColor: 'blue',
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,

    // lineHeight: 19,
    // ...textStyles.caption,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dateText: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  progressWrap: {
    marginTop: spacing.sm,
  },
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  progressPct: {
    ...textStyles.caption,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  actionsRow: {
    // flex: 1,
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'stretch'
  },
  actionButtonCol: {
    flex: 1,
    minWidth: 0,
    
  },
  missionButtonDone: {
    marginVertical: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#1A6B4A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  missionButtonMissed: {
    marginVertical: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#B83838',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  uploadBtn: {
    marginTop: spacing.sm,
    marginVertical: 0,
  },
});
