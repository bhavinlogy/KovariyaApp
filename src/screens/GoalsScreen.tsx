import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppGradientHeader, Button, Card, InputField } from '../components';
import { useToast } from '../context/ToastContext';
import type { Goal, GoalStatus } from '../types';
import { formatAppDate } from '../utils/dateFormat';
import {
  getFloatingTabBarBottomPadding,
  borderRadius,
  colors,
  spacing,
  textStyles,
  typography,
} from '../theme';
import { floatingPillShadow, goalStatusFloatingPalette } from '../theme/missionPillStyles';

const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Morning routine streak',
    description: 'Complete the morning checklist before school each day.',
    currentRawPoints: 120,
    targetRawPoints: 200,
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    rewardName: 'Movie night',
    rewardValue: '$25 voucher',
    status: 'active',
  },
  {
    id: 'g2',
    title: 'Homework before play',
    description: 'Finish homework before recreational screen time.',
    currentRawPoints: 80,
    targetRawPoints: 80,
    startDate: '2026-02-15',
    endDate: '2026-03-31',
    rewardName: 'New art supplies',
    status: 'completed',
  },
  {
    id: 'g3',
    title: 'Kind words challenge',
    description: 'Log kind actions toward family members.',
    currentRawPoints: 45,
    targetRawPoints: 150,
    startDate: '2026-03-10',
    endDate: '2026-05-01',
    rewardName: 'Choose weekend activity',
    status: 'paused',
  },
];

function formatGoalStatusLabel(status: GoalStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'paused':
      return 'Paused';
    default:
      return status;
  }
}

function rawProgressPercent(goal: Goal): number {
  if (goal.targetRawPoints <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((goal.currentRawPoints / goal.targetRawPoints) * 100));
}

function rewardDisplay(goal: Goal): string {
  const base = goal.rewardName.trim();
  if (goal.rewardValue?.trim()) {
    return `${base} (${goal.rewardValue.trim()})`;
  }
  return base;
}

const GoalsScreen: React.FC = () => {
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [modalOpen, setModalOpen] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formRewardName, setFormRewardName] = useState('');
  const [formRewardValue, setFormRewardValue] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formTargetRaw, setFormTargetRaw] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const bottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const pri = (g: Goal) => (g.status === 'active' ? 0 : g.status === 'paused' ? 1 : 2);
      const p = pri(a) - pri(b);
      if (p !== 0) {
        return p;
      }
      return a.title.localeCompare(b.title);
    });
  }, [goals]);

  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormRewardName('');
    setFormRewardValue('');
    setFormStart('');
    setFormEnd('');
    setFormTargetRaw('');
    setFormError(null);
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    resetForm();
  }, [resetForm]);

  const submitGoal = useCallback(() => {
    const title = formTitle.trim();
    const rewardName = formRewardName.trim();
    const start = formStart.trim();
    const end = formEnd.trim();
    const targetStr = formTargetRaw.trim();

    if (!title || !rewardName || !start || !end || !targetStr) {
      setFormError('Please fill in goal name, reward, start date, end date, and target raw points.');
      return;
    }

    const target = Number.parseInt(targetStr, 10);
    if (!Number.isFinite(target) || target <= 0) {
      setFormError('Target raw points must be a positive number.');
      return;
    }

    const startT = Date.parse(start);
    const endT = Date.parse(end);
    if (Number.isNaN(startT) || Number.isNaN(endT)) {
      setFormError('Use valid dates (e.g. 2026-04-15).');
      return;
    }
    if (endT < startT) {
      setFormError('End date must be on or after start date.');
      return;
    }

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title,
      description: '',
      currentRawPoints: 0,
      targetRawPoints: target,
      startDate: start,
      endDate: end,
      rewardName,
      rewardValue: formRewardValue.trim() || undefined,
      status: 'active',
    };

    setGoals((prev) => [newGoal, ...prev]);
    showToast({ type: 'success', message: 'Goal created' });
    closeModal();
  }, [
    formTitle,
    formRewardName,
    formRewardValue,
    formStart,
    formEnd,
    formTargetRaw,
    showToast,
    closeModal,
  ]);

  const headerRight = useMemo(
    () => (
      <Pressable
        onPress={openModal}
        style={({ pressed }) => [styles.headerAddBtn, pressed && styles.headerAddBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Add new goal"
      >
        <Icon name="add" size={26} color={colors.surface} />
      </Pressable>
    ),
    [openModal]
  );

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <AppGradientHeader
        title="Goals"
        subtitle="Reward-based behaviour goals"
        rightAccessory={headerRight}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {sortedGoals.map((goal) => {
          const pct = rawProgressPercent(goal);
          const statusPal = goalStatusFloatingPalette(goal.status);
          const isCompleted = goal.status === 'completed';
          return (
            <Animated.View key={goal.id} entering={FadeInDown.springify().damping(18).stiffness(220)}>
              <Card
                variant="elevated"
                style={StyleSheet.flatten([styles.card, isCompleted ? styles.cardCompleted : null])}
              >
                <Pressable
                  style={({ pressed }) => [pressed && styles.cardPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`${goal.title}. ${formatGoalStatusLabel(goal.status)}.`}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {goal.title}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.floatingPill,
                        floatingPillShadow(statusPal.shadowColor),
                        { backgroundColor: statusPal.bg },
                      ]}
                    >
                      <Text style={[styles.floatingPillText, { color: statusPal.text }]}>
                        {formatGoalStatusLabel(goal.status)}
                      </Text>
                    </View>
                  </View>

                  {goal.description ? <Text style={styles.cardDesc}>{goal.description}</Text> : null}

                  <View style={styles.badgeRow}>
                    <View style={[styles.chip, { backgroundColor: colors.skySoft }]}>
                      <Text style={[styles.chipText, { color: colors.primaryDark }]}>Raw points</Text>
                    </View>
                    <Text style={styles.rewardLine} numberOfLines={2}>
                      Reward: {rewardDisplay(goal)}
                    </Text>
                  </View>

                  <View style={styles.dateRow}>
                    <Text style={styles.dateText}>Start: {formatAppDate(goal.startDate)}</Text>
                    <Text style={styles.dateText}>End: {formatAppDate(goal.endDate)}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      Target: {goal.targetRawPoints} pts · Current: {goal.currentRawPoints} pts
                    </Text>
                  </View>

                  <View style={styles.progressWrap}>
                    <View style={styles.progressHead}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPct}>{pct}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                </Pressable>
              </Card>
            </Animated.View>
          );
        })}
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <SafeAreaView style={styles.modalSafe} edges={['top', 'left', 'right']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New goal</Text>
              <Pressable
                onPress={closeModal}
                style={({ pressed }) => [styles.modalClose, pressed && styles.modalClosePressed]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Icon name="close" size={26} color={colors.ink} />
              </Pressable>
            </View>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <InputField
                label="Goal name"
                placeholder="e.g. Morning routine streak"
                value={formTitle}
                onChangeText={setFormTitle}
              />
              <View style={styles.fieldGap} />
              <InputField
                label="Reward name"
                placeholder="e.g. Movie night"
                value={formRewardName}
                onChangeText={setFormRewardName}
              />
              <View style={styles.fieldGap} />
              <InputField
                label="Reward value (optional)"
                placeholder="e.g. $25 or extra 30 min"
                value={formRewardValue}
                onChangeText={setFormRewardValue}
              />
              <View style={styles.fieldGap} />
              <InputField
                label="Start date"
                placeholder="YYYY-MM-DD"
                value={formStart}
                onChangeText={setFormStart}
                autoCapitalize="none"
              />
              <View style={styles.fieldGap} />
              <InputField
                label="End date"
                placeholder="YYYY-MM-DD"
                value={formEnd}
                onChangeText={setFormEnd}
                autoCapitalize="none"
              />
              <View style={styles.fieldGap} />
              <InputField
                label="Target raw points"
                placeholder="e.g. 200"
                value={formTargetRaw}
                onChangeText={setFormTargetRaw}
                keyboardType="number-pad"
              />
              {formError ? <Text style={styles.formError}>{formError}</Text> : null}
              <Button title="Create goal" variant="primary" onPress={submitGoal} style={styles.submitBtn} />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingVertical: spacing.sm
  },
  headerAddBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  headerAddBtnPressed: {
    opacity: 0.85,
  },
  card: {
    marginVertical: spacing.xs,
    overflow: 'visible',
  },
  cardCompleted: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63, 169, 122, 0.35)',
    backgroundColor: colors.surface,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardHeader: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingRight: 0,
    minHeight: 40,
  },
  cardTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  cardTitle: {
    ...textStyles.headingMedium,
    flex: 1,
    color: colors.ink,
    fontWeight: '800',
  },
  floatingPill: {
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexShrink: 0,
  },
  floatingPillText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardDesc: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chip: {
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
  rewardLine: {
    ...textStyles.caption,
    flex: 1,
    minWidth: 120,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
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
  metaRow: {
    marginTop: spacing.xs,
  },
  metaText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '700',
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
  modalRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...textStyles.headingMedium,
    fontWeight: '800',
    color: colors.ink,
  },
  modalClose: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClosePressed: {
    opacity: 0.7,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  fieldGap: {
    height: spacing.md,
  },
  formError: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: spacing.lg,
  },
});

export default GoalsScreen;
