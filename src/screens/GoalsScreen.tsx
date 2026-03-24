import React, { useState, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Button, ProgressCircle } from '../components';
import {
  colors,
  spacing,
  textStyles,
  getFloatingTabBarBottomPadding,
  borderRadius,
} from '../theme';
import { Goal, Mission, Quiz } from '../types';

type GoalsTabKey = 'goals' | 'missions' | 'quizzes' | 'tutorials';

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Improve Communication',
    description: 'Daily family discussions for 15 minutes',
    progress: 60,
    target: 100,
    deadline: '5 days left',
    reward: '50 points',
    isActive: true,
  },
  {
    id: '2',
    title: 'Complete Homework on Time',
    description: 'Submit all assignments before deadline',
    progress: 80,
    target: 100,
    deadline: '3 days left',
    reward: '30 points',
    isActive: true,
  },
];

const MOCK_MISSIONS: Mission[] = [
  {
    id: '1',
    title: 'Share a Kind Act',
    description: 'Document something kind you did today',
    type: 'photo',
    points: 20,
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Voice Journal',
    description: 'Record your thoughts about today',
    type: 'voice',
    points: 15,
    isCompleted: false,
  },
];

const MOCK_QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'Emotional Intelligence',
    questions: 10,
    completed: false,
  },
  {
    id: '2',
    title: 'Social Skills',
    questions: 8,
    completed: true,
    score: 85,
    time: '5 min',
  },
];

const TABS: { key: GoalsTabKey; label: string; icon: string }[] = [
  { key: 'goals', label: 'Active Goals', icon: 'flag' },
  { key: 'missions', label: 'Missions', icon: 'assignment' },
  { key: 'quizzes', label: 'Quizzes', icon: 'quiz' },
  { key: 'tutorials', label: 'Tutorials', icon: 'school' },
];

const GoalsPanel = memo(function GoalsPanel() {
  const onCreateGoal = useCallback(() => {
    // Wire to create-goal flow
  }, []);

  return (
    <View>
      <Button title="+ Create New Goal" variant="outline" onPress={onCreateGoal} style={styles.createButton} />
      {MOCK_GOALS.map((goal) => (
        <Card key={goal.id} variant="elevated" style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <ProgressCircle
              size={40}
              progress={goal.progress}
              color={colors.growth}
              strokeWidth={4}
            />
          </View>
          <Text style={styles.goalDescription}>{goal.description}</Text>
          <View style={styles.goalFooter}>
            <Text style={styles.goalDeadline}>{goal.deadline}</Text>
            <View style={styles.rewardBadge}>
              <Icon name="stars" size={16} color={colors.accent} />
              <Text style={styles.rewardText}>{goal.reward}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
});

const MissionsPanel = memo(function MissionsPanel() {
  return (
    <View>
      {MOCK_MISSIONS.map((mission) => (
        <Card key={mission.id} variant="elevated" style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionPoints}>+{mission.points} pts</Text>
          </View>
          <Text style={styles.missionDescription}>{mission.description}</Text>
          <View style={styles.missionActions}>
            {mission.type === 'photo' && (
              <TouchableOpacity
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Submit photo for mission"
              >
                <Icon name="camera-alt" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Photo</Text>
              </TouchableOpacity>
            )}
            {mission.type === 'voice' && (
              <TouchableOpacity
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Submit voice for mission"
              >
                <Icon name="mic" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Voice</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.textButton]}
              accessibilityRole="button"
              accessibilityLabel="Submit text for mission"
            >
              <Icon name="text-fields" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Text</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );
});

const QuizzesPanel = memo(function QuizzesPanel() {
  const onQuizPress = useCallback(() => {
    // Wire to quiz flow
  }, []);

  return (
    <View>
      {MOCK_QUIZZES.map((quiz) => (
        <Card key={quiz.id} variant="elevated" style={styles.quizCard}>
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
          {quiz.completed ? (
            <Text style={styles.quizTime}>Completed in {quiz.time}</Text>
          ) : null}
          <Button
            title={quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
            variant={quiz.completed ? 'outline' : 'primary'}
            onPress={onQuizPress}
          />
        </Card>
      ))}
    </View>
  );
});

const TutorialsPanel = memo(function TutorialsPanel() {
  const onWatch = useCallback(() => {
    // Wire to video / tutorial
  }, []);

  return (
    <View>
      <Card variant="elevated" style={styles.tutorialCard}>
        <Icon name="play-circle-filled" size={40} color={colors.primary} />
        <Text style={styles.tutorialTitle}>Understanding Emotions</Text>
        <Text style={styles.tutorialDuration}>15 min</Text>
        <Button title="Watch" variant="outline" onPress={onWatch} />
      </Card>
    </View>
  );
});

const GoalsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollBottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );
  const [activeTab, setActiveTab] = useState<GoalsTabKey>('goals');

  const onTabPress = useCallback((key: GoalsTabKey) => {
    setActiveTab(key);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollBottomPad }}
      >
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
                size={20}
                color={activeTab === tab.key ? colors.ink : colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'goals' ? <GoalsPanel /> : null}
          {activeTab === 'missions' ? <MissionsPanel /> : null}
          {activeTab === 'quizzes' ? <QuizzesPanel /> : null}
          {activeTab === 'tutorials' ? <TutorialsPanel /> : null}
        </View>
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
    padding: spacing.sm,
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
  },
  tabButtonActive: {
    backgroundColor: colors.lavenderSoft,
  },
  tabText: {
    ...textStyles.caption,
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  createButton: {
    marginBottom: spacing.md,
  },
  goalCard: {
    marginBottom: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalTitle: {
    ...textStyles.headingMedium,
    flex: 1,
  },
  goalDescription: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  rewardText: {
    ...textStyles.caption,
    color: colors.accent,
    marginLeft: spacing.xs,
  },
  missionCard: {
    marginBottom: spacing.sm,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  missionTitle: {
    ...textStyles.headingMedium,
    flex: 1,
  },
  missionPoints: {
    ...textStyles.bodyMedium,
    color: colors.growth,
    fontWeight: '600',
  },
  missionDescription: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  missionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  textButton: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  actionText: {
    ...textStyles.caption,
    marginTop: spacing.xs,
  },
  quizCard: {
    marginBottom: spacing.sm,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quizTitle: {
    ...textStyles.headingMedium,
    flex: 1,
  },
  quizQuestions: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    ...textStyles.caption,
    color: colors.growth,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  quizTime: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tutorialCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  tutorialTitle: {
    ...textStyles.headingMedium,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  tutorialDuration: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});

export default GoalsScreen;
