import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from '../Button';
import { borderRadius, colors, spacing, textStyles } from '../../theme';
import { Quiz } from '../../types';

type Phase = 'intro' | 'quiz' | 'result';

export type QuizQuestionItem = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

/** In-app question bank keyed by quiz id (sample length for UX demo). */
const QUIZ_BANK: Record<string, QuizQuestionItem[]> = {
  q1: [
    {
      id: 'q1-1',
      prompt: 'Which action best shows civic responsibility in your neighborhood?',
      options: [
        'Ignoring litter because it is not your property',
        'Reporting unsafe wiring to authorities',
        'Only cleaning your own doorstep',
        'Avoiding community meetings',
      ],
      correctIndex: 1,
    },
    {
      id: 'q1-2',
      prompt: 'Why is voting considered a civic duty in many democracies?',
      options: [
        'It is optional and has no impact',
        'It helps shape leadership and policies that affect everyone',
        'It only benefits political parties',
        'It replaces the need for local volunteering',
      ],
      correctIndex: 1,
    },
    {
      id: 'q1-3',
      prompt: 'Pick the most respectful way to disagree in a community forum.',
      options: [
        'Interrupt and speak louder',
        'Listen, then respond calmly with facts',
        'Post anonymously without accountability',
        'Leave without explaining your view',
      ],
      correctIndex: 1,
    },
  ],
  q2: [
    {
      id: 'q2-1',
      prompt: 'Discipline in a family context usually means…',
      options: [
        'Punishment without explanation',
        'Consistent boundaries with care and explanation',
        'Letting children decide everything alone',
        'Avoiding routines entirely',
      ],
      correctIndex: 1,
    },
    {
      id: 'q2-2',
      prompt: 'Showing respect at home often starts with…',
      options: [
        'Ignoring household rules',
        'Modeling polite communication and listening',
        'Rewarding only achievements',
        'Comparing siblings publicly',
      ],
      correctIndex: 1,
    },
  ],
};

export type QuizCompletePayload = {
  quizId: string;
  score: number;
  timeLabel: string;
  breakdown: { prompt: string; ok: boolean }[];
};

type Props = {
  visible: boolean;
  quiz: Quiz | null;
  /** Fresh attempt from intro/quiz, or jump to saved result summary. */
  startMode: 'attempt' | 'result';
  onClose: () => void;
  onComplete: (payload: QuizCompletePayload) => void;
  onRetake: () => void;
};

export function QuizSessionModal({
  visible,
  quiz,
  startMode,
  onClose,
  onComplete,
  onRetake,
}: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [resultSource, setResultSource] = useState<'fresh' | 'history'>('history');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const questions = useMemo(() => (quiz ? QUIZ_BANK[quiz.id] ?? [] : []), [quiz]);

  useEffect(() => {
    if (!visible || !quiz) {
      return;
    }
    setCurrentIndex(0);
    setAnswers({});
    setStartedAt(null);
    if (startMode === 'result') {
      setPhase('result');
      setResultSource('history');
    } else {
      setPhase('intro');
      setResultSource('fresh');
    }
  }, [visible, quiz, startMode]);

  const handleStart = useCallback(() => {
    setStartedAt(Date.now());
    setPhase('quiz');
    setCurrentIndex(0);
    setAnswers({});
  }, []);

  const selectOption = useCallback((qid: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  }, []);

  const currentQ = questions[currentIndex];
  const answeredCurrent = currentQ ? answers[currentQ.id] !== undefined : false;

  const finishQuiz = useCallback(() => {
    let correct = 0;
    const breakdown: { prompt: string; ok: boolean }[] = [];
    questions.forEach((q) => {
      const ok = answers[q.id] === q.correctIndex;
      if (ok) {
        correct += 1;
      }
      breakdown.push({ prompt: q.prompt, ok });
    });
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const elapsedSec = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const timeLabel = mins > 0 ? `${mins} min ${secs}s` : `${secs}s`;
    if (quiz) {
      onComplete({ quizId: quiz.id, score, timeLabel, breakdown });
    }
    setResultSource('fresh');
    setPhase('result');
  }, [answers, onComplete, questions, quiz, startedAt]);

  const goNext = useCallback(() => {
    if (!answeredCurrent || !currentQ) {
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  }, [answeredCurrent, currentIndex, currentQ, finishQuiz, questions.length]);

  const freshStats = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, total: questions.length, score };
  }, [answers, questions]);

  const displayScore =
    phase === 'result' && resultSource === 'history' && quiz?.score != null
      ? quiz.score
      : freshStats.score;

  const headline =
    displayScore >= 80 ? 'Strong work' : displayScore >= 60 ? 'Nice effort' : 'Room to grow';

  if (!quiz) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="Close quiz"
          >
            <Icon name="close" size={22} color={colors.ink} />
          </Pressable>
          {phase === 'quiz' ? (
            <Text style={styles.headerMeta}>
              {currentIndex + 1} / {questions.length}
            </Text>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          <View style={styles.headerSpacer} />
        </View>

        {phase === 'intro' ? (
          <ScrollView
            contentContainerStyle={styles.introScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroIconWrap}>
              <Icon name="quiz" size={36} color={colors.primary} />
            </View>
            {quiz.category ? (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{quiz.category}</Text>
              </View>
            ) : null}
            <Text style={styles.introTitle}>{quiz.title}</Text>
            <Text style={styles.introBody}>
              Answer at your own pace. You can review each question before submitting the quiz.
            </Text>
            <View style={styles.introFacts}>
              <View style={styles.introFact}>
                <Icon name="help-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.introFactText}>{questions.length} questions</Text>
              </View>
              {quiz.estimatedMinutes != null ? (
                <View style={styles.introFact}>
                  <Icon name="schedule" size={20} color={colors.textSecondary} />
                  <Text style={styles.introFactText}>~{quiz.estimatedMinutes} min</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.introActions}>
              <Button title="Start quiz" onPress={handleStart} variant="primary" size="large" />
              <Button title="Not now" onPress={onClose} variant="ghost" size="medium" />
            </View>
          </ScrollView>
        ) : null}

        {phase === 'quiz' && currentQ ? (
          <View style={styles.quizBody}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentIndex + 1) / questions.length) * 100}%` },
                ]}
              />
            </View>
            <ScrollView
              style={styles.questionScroll}
              contentContainerStyle={styles.questionScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.questionPrompt}>{currentQ.prompt}</Text>
              {currentQ.options.map((opt, idx) => {
                const selected = answers[currentQ.id] === idx;
                return (
                  <Pressable
                    key={`${currentQ.id}-${idx}`}
                    onPress={() => selectOption(currentQ.id, idx)}
                    style={[styles.optionPill, selected && styles.optionPillSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <View style={[styles.optionRadio, selected && styles.optionRadioOn]}>
                      {selected ? <View style={styles.optionRadioDot} /> : null}
                    </View>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.quizFooter}>
              <Button
                title={currentIndex >= questions.length - 1 ? 'Submit' : 'Next'}
                onPress={goNext}
                variant="primary"
                size="large"
                disabled={!answeredCurrent}
              />
            </View>
          </View>
        ) : null}

        {phase === 'result' ? (
          <ScrollView
            contentContainerStyle={styles.resultScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.scoreRing}>
              <Text style={styles.scoreValue}>{displayScore}%</Text>
              <Text style={styles.scoreLabel}>{headline}</Text>
            </View>
            <Text style={styles.resultSub}>
              {resultSource === 'history' && quiz.time
                ? `Last attempt • ${quiz.time}`
                : resultSource === 'fresh'
                  ? 'Saved to your progress'
                  : 'Result summary'}
            </Text>

            {resultSource === 'fresh' ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>This attempt</Text>
                <Text style={styles.summaryLine}>
                  {freshStats.correct} of {freshStats.total} correct
                </Text>
              </View>
            ) : (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Recorded result</Text>
                <Text style={styles.summaryLine}>
                  Score {quiz.score}% {quiz.time ? `• ${quiz.time}` : ''}
                </Text>
              </View>
            )}

            {resultSource === 'fresh' && questions.length > 0 ? (
              <View style={styles.breakdown}>
                <Text style={styles.breakdownTitle}>Review</Text>
                {questions.map((q) => {
                  const ok = answers[q.id] === q.correctIndex;
                  return (
                    <View key={q.id} style={styles.breakdownRow}>
                      <Icon
                        name={ok ? 'check-circle' : 'cancel'}
                        size={20}
                        color={ok ? colors.growth : colors.error}
                      />
                      <Text style={styles.breakdownPrompt} numberOfLines={3}>
                        {q.prompt}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {resultSource === 'history' ? (
              <View style={styles.insightCard}>
                <Icon name="lightbulb-outline" size={22} color={colors.accent} />
                <Text style={styles.insightText}>
                  Open “Attempt quiz” anytime to practice again. Retaking updates your latest score
                  when your mentor enables it.
                </Text>
              </View>
            ) : null}

            <View style={styles.resultActions}>
              <Button title="Done" onPress={onClose} variant="primary" size="large" />
              <Button title="Retake quiz" onPress={onRetake} variant="outline" size="large" />
            </View>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  headerMeta: {
    ...textStyles.caption,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  headerSpacer: {
    width: 40,
  },
  introScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(124, 106, 232, 0.28)',
  },
  categoryChip: {
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.peachSoft,
    marginBottom: spacing.sm,
  },
  categoryChipText: {
    ...textStyles.caption,
    fontWeight: '800',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  introTitle: {
    ...textStyles.headingLarge,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  introBody: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  introFacts: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  introActions: {
    width: '100%',
    gap: spacing.sm,
  },
  introFact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  introFactText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  quizBody: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceMuted,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  questionScroll: {
    flex: 1,
  },
  questionScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  questionPrompt: {
    ...textStyles.headingMedium,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  optionPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.lavenderSoft,
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  optionRadioOn: {
    borderColor: colors.primary,
  },
  optionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: colors.ink,
    fontWeight: '600',
  },
  quizFooter: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  resultScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  scoreRing: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    borderColor: colors.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  scoreValue: {
    ...textStyles.headingLarge,
    fontSize: 36,
    color: colors.primaryDark,
  },
  scoreLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 4,
  },
  resultSub: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryLine: {
    ...textStyles.bodyMedium,
    color: colors.ink,
    fontWeight: '600',
  },
  breakdown: {
    marginBottom: spacing.lg,
  },
  breakdownTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  breakdownPrompt: {
    ...textStyles.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  insightCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    backgroundColor: colors.accentLight,
    marginBottom: spacing.lg,
  },
  insightText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  resultActions: {
    gap: spacing.sm,
  },
});
