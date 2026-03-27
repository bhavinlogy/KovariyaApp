import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button, Card } from '../components';
import {
  borderRadius,
  colors,
  getFloatingTabBarBottomPadding,
  spacing,
  textStyles,
} from '../theme';
import { Goal, Mission, Quiz } from '../types';

type GoalsTabKey = 'goals' | 'missions' | 'quizzes';
type MissionWithEvidence = Mission & {
  evidenceTypes: Array<'photo' | 'voice' | 'text'>;
  assignedBy: 'Mentor' | 'School';
};

const MOCK_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Respectful Morning Routine',
    description: 'Follow routine steps with polite communication before school.',
    progress: 34,
    target: 60,
    deadline: '12 days left',
    reward: 'Movie night',
    isActive: true,
  },
  {
    id: 'g2',
    title: 'Homework Discipline Streak',
    description: 'Complete and review homework before 8:00 PM for 2 weeks.',
    progress: 52,
    target: 80,
    deadline: '7 days left',
    reward: 'Board game choice',
    isActive: true,
  },
  {
    id: 'g3',
    title: 'Kindness in Action',
    description: 'Do one intentional kind action each day and log it.',
    progress: 20,
    target: 40,
    deadline: '9 days left',
    reward: 'Weekend picnic',
    isActive: true,
  },
];

const MOCK_MISSIONS: MissionWithEvidence[] = [
  {
    id: 'm1',
    title: 'Plant a Tree',
    description: 'Plant one sapling and explain how you will care for it.',
    type: 'photo',
    points: 25,
    isCompleted: false,
    evidenceTypes: ['photo', 'voice', 'text'],
    assignedBy: 'Mentor',
  },
  {
    id: 'm2',
    title: 'Keep Street Clean',
    description: 'Spend 15 minutes cleaning nearby surroundings safely.',
    type: 'text',
    points: 20,
    isCompleted: false,
    evidenceTypes: ['photo', 'text'],
    assignedBy: 'School',
  },
  {
    id: 'm3',
    title: 'Save Electricity',
    description: 'Track and reduce unnecessary power usage for one day.',
    type: 'voice',
    points: 18,
    isCompleted: true,
    evidenceTypes: ['voice', 'text'],
    assignedBy: 'Mentor',
    submission: {
      text: 'Turned off fan/lights when leaving rooms. Saved evening usage.',
      timestamp: 'Today, 6:45 PM',
    },
  },
];

const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    title: 'Civic Responsibility Basics',
    questions: 12,
    completed: false,
  },
  {
    id: 'q2',
    title: 'Respect & Discipline Quiz',
    questions: 10,
    completed: true,
    score: 88,
    time: '6 min',
  },
];

const TABS: { key: GoalsTabKey; label: string; icon: string }[] = [
  { key: 'goals', label: 'Goals', icon: 'flag' },
  { key: 'missions', label: 'Missions', icon: 'assignment' },
  { key: 'quizzes', label: 'Quizzes', icon: 'quiz' },
];

function pct(progress: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((progress / target) * 100)));
}

const GoalsPanel = memo(function GoalsPanel({ goals }: { goals: Goal[] }) {
  return (
    <View>
      {goals.map((goal) => {
        const progressPct = pct(goal.progress, goal.target);
        return (
          <Animated.View key={goal.id} entering={FadeInDown.springify().damping(18).stiffness(220)}>
            <Card variant="elevated" style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <View style={styles.progressChip}>
                  <Text style={styles.progressChipText}>{progressPct}%</Text>
                </View>
              </View>
              <Text style={styles.goalDescription}>{goal.description}</Text>

              <View style={styles.linearTrack}>
                <View style={[styles.linearFill, { width: `${progressPct}%` }]} />
              </View>

              <View style={styles.goalMetaRow}>
                <Text style={styles.goalMetaText}>
                  Raw points: {goal.progress}/{goal.target}
                </Text>
                <Text style={styles.goalMetaText}>{goal.deadline}</Text>
              </View>

              <View style={styles.goalFooter}>
                <View style={styles.rewardBadge}>
                  <Icon name="card-giftcard" size={16} color={colors.accent} />
                  <Text style={styles.rewardText}>Reward: {goal.reward}</Text>
                </View>
                <TouchableOpacity
                  style={styles.rowAction}
                  accessibilityRole="button"
                  accessibilityLabel="Track goal progress"
                >
                  <Text style={styles.rowActionText}>Track</Text>
                  <Icon name="chevron-right" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>
        );
      })}
    </View>
  );
});

const MissionsPanel = memo(function MissionsPanel({ missions }: { missions: MissionWithEvidence[] }) {
  return (
    <View>
      {missions.map((mission) => (
        <Animated.View key={mission.id} entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <Card variant="elevated" style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <View style={[styles.statusPill, mission.isCompleted && styles.statusPillDone]}>
                <Text style={[styles.statusPillText, mission.isCompleted && styles.statusPillTextDone]}>
                  {mission.isCompleted ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
            <Text style={styles.missionDescription}>{mission.description}</Text>

            <View style={styles.metaCluster}>
              <Text style={styles.metaText}>Assigned by: {mission.assignedBy}</Text>
              <Text style={styles.metaText}>Reward: +{mission.points} raw points</Text>
            </View>

            <Text style={styles.evidenceLabel}>Evidence submission</Text>
            <View style={styles.evidenceActions}>
              {mission.evidenceTypes.map((type) => (
                <TouchableOpacity
                  key={`${mission.id}-${type}`}
                  style={styles.evidenceBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Submit ${type} evidence`}
                >
                  <Icon
                    name={type === 'photo' ? 'camera-alt' : type === 'voice' ? 'keyboard-voice' : 'notes'}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.evidenceBtnText}>
                    {type === 'photo' ? 'Photo' : type === 'voice' ? 'Voice' : 'Text'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.approvalNote}>Mentor/school approves completion after submission review.</Text>
          </Card>
        </Animated.View>
      ))}
    </View>
  );
});

const QuizzesPanel = memo(function QuizzesPanel({ quizzes }: { quizzes: Quiz[] }) {
  const onQuizPress = useCallback(() => {
    // Wire to quiz flow
  }, []);

  return (
    <View>
      {quizzes.map((quiz) => (
        <Animated.View key={quiz.id} entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <Card variant="elevated" style={styles.quizCard}>
            <View style={styles.quizHeader}>
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              {quiz.completed ? (
                <View style={styles.completedBadge}>
                  <Icon name="check-circle" size={20} color={colors.growth} />
                  <Text style={styles.completedText}>{quiz.score}%</Text>
                </View>
              ) : (
                <Text style={styles.quizQuestions}>{quiz.questions} questions</Text>
              )}
            </View>
            <Text style={styles.quizSubline}>
              {quiz.completed
                ? `Result available • Completed in ${quiz.time}`
                : 'Assigned by mentor • Ready to attempt'}
            </Text>
            <View style={styles.quizActionRow}>
              <Button
                title={quiz.completed ? 'View result' : 'Attempt quiz'}
                variant={quiz.completed ? 'outline' : 'primary'}
                size="small"
                onPress={onQuizPress}
                style={styles.quizActionButton}
              />
              {quiz.completed ? (
                <Button title="Retake" variant="ghost" size="small" onPress={onQuizPress} style={styles.quizGhost} />
              ) : null}
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  );
});

const GoalsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollBottomPad = useMemo(() => getFloatingTabBarBottomPadding(insets.bottom), [insets.bottom]);
  const [activeTab, setActiveTab] = useState<GoalsTabKey>('goals');
  const [showAddGoalOverlay, setShowAddGoalOverlay] = useState(false);
  const addGoalProgress = useSharedValue(0);

  const onTabPress = useCallback((key: GoalsTabKey) => {
    setActiveTab(key);
  }, []);

  const openAddGoal = useCallback(() => {
    setShowAddGoalOverlay(true);
  }, []);

  const closeAddGoal = useCallback(() => {
    addGoalProgress.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    setTimeout(() => setShowAddGoalOverlay(false), 210);
  }, [addGoalProgress]);

  useEffect(() => {
    if (!showAddGoalOverlay) {
      return;
    }
    addGoalProgress.value = withTiming(1, {
      duration: 340,
      easing: Easing.out(Easing.exp),
    });
  }, [showAddGoalOverlay, addGoalProgress]);

  const addGoalOverlayAnim = useAnimatedStyle(() => ({
    opacity: interpolate(addGoalProgress.value, [0, 1], [0, 1]),
    transform: [
      { scale: interpolate(addGoalProgress.value, [0, 1], [0.94, 1]) },
      { translateY: interpolate(addGoalProgress.value, [0, 1], [26, 0]) },
    ],
    borderRadius: interpolate(addGoalProgress.value, [0, 1], [36, 0]),
  }));

  const totalGoals = MOCK_GOALS.length;
  const activeGoals = MOCK_GOALS.filter((g) => g.isActive).length;
  const completedMissions = MOCK_MISSIONS.filter((m) => m.isCompleted).length;
  const pendingQuizzes = MOCK_QUIZZES.filter((q) => !q.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollBottomPad }}
      >
        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <Card variant="elevated" style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Parent Action Hub</Text>
            <Text style={styles.heroTitle}>Goals, Missions, Quizzes</Text>
            <Text style={styles.heroSubtitle}>
              Goals use raw points for progress tracking. Analytics uses adjusted score system separately.
            </Text>

            <View style={styles.heroStats}>
              <View style={[styles.statPill, styles.statPillGoals]}>
                <View style={styles.statPillIconWrap}>
                  <Icon name="flag" size={16} color={colors.primary} />
                </View>
                <Text style={styles.statPillValue}>{activeGoals}/{totalGoals}</Text>
                <Text style={styles.statPillLabel}>Goals Active</Text>
                <Text style={styles.statPillHint}>In progress now</Text>
              </View>
              <View style={[styles.statPill, styles.statPillMissions]}>
                <View style={styles.statPillIconWrap}>
                  <Icon name="verified" size={16} color={colors.growth} />
                </View>
                <Text style={styles.statPillValue}>{completedMissions}</Text>
                <Text style={styles.statPillLabel}>Missions Completed</Text>
                <Text style={styles.statPillHint}>Mentor/School verified</Text>
              </View>
              <View style={[styles.statPill, styles.statPillQuizzes]}>
                <View style={styles.statPillIconWrap}>
                  <Icon name="quiz" size={16} color={colors.accent} />
                </View>
                <Text style={styles.statPillValue}>{pendingQuizzes}</Text>
                <Text style={styles.statPillLabel}>Quizzes Pending</Text>
                <Text style={styles.statPillHint}>Ready to attempt</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => onTabPress(tab.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: activeTab === tab.key }}
              accessibilityLabel={tab.label}
            >
              <Icon
                name={tab.icon}
                size={18}
                color={activeTab === tab.key ? colors.ink : colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View entering={FadeInDown.duration(260)} key={activeTab} style={styles.contentContainer}>
          {activeTab === 'goals' ? <GoalsPanel goals={MOCK_GOALS} /> : null}
          {activeTab === 'missions' ? <MissionsPanel missions={MOCK_MISSIONS} /> : null}
          {activeTab === 'quizzes' ? <QuizzesPanel quizzes={MOCK_QUIZZES} /> : null}
        </Animated.View>
      </ScrollView>

      <Pressable
        onPress={openAddGoal}
        style={[styles.fab, { bottom: Math.max(insets.bottom, spacing.md) + 86 }]}
        accessibilityRole="button"
        accessibilityLabel="Open add goal"
      >
         <Icon name="add" size={28} color={colors.surface} />
        {/* <Text style={styles.fabText}>Add Goal</Text> */}
      </Pressable>

      {showAddGoalOverlay ? (
        <Animated.View style={[styles.addGoalOverlay, addGoalOverlayAnim]}>
          <SafeAreaView style={styles.addGoalSafe} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.addGoalHeader}>
              <TouchableOpacity
                onPress={closeAddGoal}
                style={styles.addGoalClose}
                accessibilityRole="button"
                accessibilityLabel="Close add goal"
              >
                <Icon name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.addGoalBody}>
              {/* <View style={styles.addGoalBlankCard}> */}
                <Text style={styles.addGoalBlankText}>Add Goal</Text>
              {/* </View> */}
            </View>
          </SafeAreaView>
        </Animated.View>
      ) : null}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heroCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.skySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(88, 132, 197, 0.22)',
  },
  heroEyebrow: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroTitle: {
    ...textStyles.headingLarge,
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 21,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 108,
  },
  statPillGoals: {
    backgroundColor: colors.lavenderSoft,
    borderColor: 'rgba(124, 106, 232, 0.25)',
  },
  statPillMissions: {
    backgroundColor: colors.mintSoft,
    borderColor: 'rgba(63, 169, 122, 0.25)',
  },
  statPillQuizzes: {
    backgroundColor: colors.peachSoft,
    borderColor: 'rgba(232, 160, 74, 0.25)',
  },
  statPillIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: 6,
  },
  statPillValue: {
    ...textStyles.headingMedium,
    color: colors.ink,
    fontSize: 22,
    lineHeight: 26,
  },
  statPillLabel: {
    ...textStyles.caption,
    color: colors.ink,
    fontWeight: '700',
    textAlign: 'center',
  },
  statPillHint: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.large,
    gap: spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: colors.lavenderSoft,
    borderWidth: 1,
    borderColor: 'rgba(124, 106, 232, 0.26)',
    transform: [{ translateY: -2 }, { scale: 1.01 }],
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  tabText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.ink,
  },
  contentContainer: {
    flex: 1,
  },
  goalCard: {
    marginBottom: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  goalTitle: {
    ...textStyles.headingMedium,
    flex: 1,
  },
  progressChip: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.mintSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(47, 168, 122, 0.28)',
  },
  progressChipText: {
    ...textStyles.caption,
    color: colors.growth,
    fontWeight: '700',
  },
  goalDescription: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  linearTrack: {
    height: 10,
    width: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  linearFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.growth,
  },
  goalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalMetaText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rewardText: {
    ...textStyles.caption,
    color: colors.accent,
    marginLeft: spacing.xs,
    fontWeight: '700',
  },
  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowActionText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  missionCard: {
    marginBottom: spacing.sm,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  missionTitle: {
    ...textStyles.headingMedium,
    flex: 1,
  },
  statusPill: {
    backgroundColor: colors.peachSoft,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 160, 74, 0.3)',
  },
  statusPillDone: {
    backgroundColor: colors.mintSoft,
    borderColor: 'rgba(47, 168, 122, 0.3)',
  },
  statusPillText: {
    ...textStyles.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  statusPillTextDone: {
    color: colors.growth,
  },
  missionDescription: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metaCluster: {
    marginBottom: spacing.sm,
  },
  metaText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  evidenceLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  evidenceActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  evidenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 6,
  },
  evidenceBtnText: {
    ...textStyles.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  approvalNote: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  quizCard: {
    marginBottom: spacing.sm,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  quizTitle: {
    ...textStyles.headingMedium,
    flex: 1,
  },
  quizQuestions: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    ...textStyles.caption,
    color: colors.growth,
    marginLeft: spacing.xs,
    fontWeight: '700',
  },
  quizSubline: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quizActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quizActionButton: {
    flex: 1,
  },
  quizGhost: {
    minWidth: 92,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    minWidth: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: {
    ...textStyles.button,
    color: colors.surface,
    fontWeight: '700',
  },
  addGoalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 20,
  },
  addGoalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  addGoalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGoalBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalBlankCard: {
    width: '100%',
    maxWidth: 460,
    minHeight: 280,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 6,
  },
  addGoalBlankText: {
    ...textStyles.headingLarge,
    color: colors.textSecondary,
    fontSize: 30,
    letterSpacing: 0.3,
  },
});

export default GoalsScreen;
