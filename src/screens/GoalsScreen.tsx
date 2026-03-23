import React, { useState } from 'react';
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
import { Goal, Mission, Quiz } from '../types';

const GoalsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'goals' | 'missions' | 'quizzes' | 'tutorials'>('goals');

  // Mock data
  const goals: Goal[] = [
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

  const missions: Mission[] = [
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

  const quizzes: Quiz[] = [
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

  const tabs = [
    { key: 'goals', label: 'Active Goals', icon: 'flag' },
    { key: 'missions', label: 'Missions', icon: 'assignment' },
    { key: 'quizzes', label: 'Quizzes', icon: 'quiz' },
    { key: 'tutorials', label: 'Tutorials', icon: 'school' },
  ];

  const renderGoals = () => (
    <View>
      <Button
        title="+ Create New Goal"
        variant="outline"
        onPress={() => console.log('Create goal')}
        style={styles.createButton}
      />
      {goals.map((goal) => (
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

  const renderMissions = () => (
    <View>
      {missions.map((mission) => (
        <Card key={mission.id} variant="elevated" style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionPoints}>+{mission.points} pts</Text>
          </View>
          <Text style={styles.missionDescription}>{mission.description}</Text>
          <View style={styles.missionActions}>
            {mission.type === 'photo' && (
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="camera-alt" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Photo</Text>
              </TouchableOpacity>
            )}
            {mission.type === 'voice' && (
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="mic" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Voice</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionButton, styles.textButton]}>
              <Icon name="text-fields" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Text</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderQuizzes = () => (
    <View>
      {quizzes.map((quiz) => (
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
          {quiz.completed && (
            <Text style={styles.quizTime}>Completed in {quiz.time}</Text>
          )}
          <Button
            title={quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
            variant={quiz.completed ? 'outline' : 'primary'}
            onPress={() => console.log('Start quiz')}
          />
        </Card>
      ))}
    </View>
  );

  const renderTutorials = () => (
    <View>
      <Card variant="elevated" style={styles.tutorialCard}>
        <Icon name="play-circle-filled" size={40} color={colors.primary} />
        <Text style={styles.tutorialTitle}>Understanding Emotions</Text>
        <Text style={styles.tutorialDuration}>15 min</Text>
        <Button title="Watch" variant="outline" onPress={() => console.log('Watch tutorial')} />
      </Card>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'goals':
        return renderGoals();
      case 'missions':
        return renderMissions();
      case 'quizzes':
        return renderQuizzes();
      case 'tutorials':
        return renderTutorials();
      default:
        return renderGoals();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {renderContent()}
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
    padding: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    ...textStyles.caption,
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  createButton: {
    marginBottom: spacing.lg,
  },
  goalCard: {
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
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
