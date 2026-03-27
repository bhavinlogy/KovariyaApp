import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Card, Chip } from '../components';
import { borderRadius, colors, getFloatingTabBarBottomPadding, spacing, textStyles } from '../theme';
import { BehaviourAspect } from '../types';

const RATING_OPTIONS = [
  { label: 'Very bad', score: -4, tone: colors.error },
  { label: 'Bad', score: -2, tone: colors.error },
  { label: 'Need improvement', score: -1, tone: colors.accent },
  { label: 'Improvement', score: 1, tone: colors.primary },
  { label: 'Good', score: 2, tone: colors.growth },
  { label: 'Very good', score: 4, tone: colors.growth },
] as const;

const POSITIVE_REASONS = [
  'Followed instructions',
  'Completed chores',
  'Shared with others',
  'Showed empathy',
  'Stayed disciplined',
  'Used polite words',
  'Helped family members',
] as const;

const NEGATIVE_REASONS = [
  'Ignored instructions',
  'Incomplete tasks',
  'Rude behaviour',
  'Frequent distractions',
  'Argumentative response',
  'Missed routine',
  'Poor social conduct',
] as const;

const INITIAL_ASPECTS: BehaviourAspect[] = [
  { id: 'respect', name: 'Respect', description: 'Courtesy toward people and rules', rating: 0, reasons: [], note: '' },
  { id: 'responsibility', name: 'Responsibility', description: 'Ownership of tasks and commitments', rating: 0, reasons: [], note: '' },
  { id: 'kindness', name: 'Kindness', description: 'Care, empathy, and support to others', rating: 0, reasons: [], note: '' },
  { id: 'discipline', name: 'Discipline', description: 'Consistency and self-control in routines', rating: 0, reasons: [], note: '' },
  { id: 'civic-sense', name: 'Civic Sense', description: 'Respect for shared spaces and social responsibility', rating: 0, reasons: [], note: '' },
];

const MAX_REASON_SELECTION = 2;

function scoreText(score: number): string {
  if (score > 0) return `+${score}`;
  return `${score}`;
}

function scoreColor(score: number): string {
  if (score >= 2) return colors.growth;
  if (score === 1) return colors.primary;
  if (score <= -2) return colors.error;
  return colors.accent;
}

type AspectPanelProps = {
  aspect: BehaviourAspect;
  onRatingChange: (aspectId: string, rating: number) => void;
  onReasonToggle: (aspectId: string, reason: string) => void;
  onNoteChange: (aspectId: string, note: string) => void;
  onVoicePress: (aspectName: string) => void;
};

const AspectPanel = memo(function AspectPanel({
  aspect,
  onRatingChange,
  onReasonToggle,
  onNoteChange,
  onVoicePress,
}: AspectPanelProps) {
  const selectedReasonCount = aspect.reasons?.length ?? 0;

  return (
    <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
      <Card variant="elevated" style={styles.aspectCard}>
        <View style={styles.aspectHeader}>
          <View style={styles.aspectTitleWrap}>
            <Text style={styles.aspectName}>{aspect.name}</Text>
            <Text style={styles.aspectDescription}>{aspect.description}</Text>
          </View>
          <View style={[styles.scoreBadge, { borderColor: scoreColor(aspect.rating) }]}>
            <Text style={[styles.scoreBadgeText, { color: scoreColor(aspect.rating) }]}>
              {aspect.rating === 0 ? '--' : scoreText(aspect.rating)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Rating score</Text>
        <View style={styles.ratingGrid}>
          {RATING_OPTIONS.map((option) => {
            const selected = aspect.rating === option.score;
            return (
              <TouchableOpacity
                key={option.label}
                onPress={() => onRatingChange(aspect.id, option.score)}
                style={[
                  styles.ratingChip,
                  {
                    borderColor: selected ? option.tone : colors.border,
                    backgroundColor: selected ? `${option.tone}22` : colors.surface,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}, ${scoreText(option.score)}`}
              >
                <Text style={[styles.ratingChipTitle, { color: selected ? option.tone : colors.textPrimary }]}>
                  {option.label}
                </Text>
                <Text style={[styles.ratingChipScore, { color: option.tone }]}>
                  {scoreText(option.score)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.reasonHeader}>
          <Text style={styles.sectionLabel}>Reason chips</Text>
          <Text style={styles.reasonHint}>Max {MAX_REASON_SELECTION} selected</Text>
        </View>

        <Text style={styles.reasonGroupTitle}>Positive reasons</Text>
        <View style={styles.chipsRow}>
          {POSITIVE_REASONS.map((reason) => (
            <Chip
              key={reason}
              label={reason}
              selected={aspect.reasons?.includes(reason) ?? false}
              onPress={() => onReasonToggle(aspect.id, reason)}
              variant="reason"
            />
          ))}
        </View>

        <Text style={styles.reasonGroupTitle}>Negative reasons</Text>
        <View style={styles.chipsRow}>
          {NEGATIVE_REASONS.map((reason) => (
            <Chip
              key={reason}
              label={reason}
              selected={aspect.reasons?.includes(reason) ?? false}
              onPress={() => onReasonToggle(aspect.id, reason)}
              variant="reason"
            />
          ))}
        </View>

        <Text style={styles.counterText}>{selectedReasonCount}/{MAX_REASON_SELECTION} reasons selected</Text>

        <View style={styles.noteArea}>
          <Text style={styles.sectionLabel}>Custom note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Write note for this aspect..."
            value={aspect.note}
            onChangeText={(txt) => onNoteChange(aspect.id, txt)}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => onVoicePress(aspect.name)}
          accessibilityRole="button"
          accessibilityLabel={`Record voice note for ${aspect.name}`}
        >
          <View style={styles.voiceIconWrap}>
            <Icon name="mic" size={18} color={colors.primary} />
          </View>
          <Text style={styles.voiceButtonText}>Record voice note</Text>
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
});

const RatingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollBottomPad = useMemo(() => getFloatingTabBarBottomPadding(insets.bottom), [insets.bottom]);

  const [selectedChild] = useState('Emma Johnson');
  const [activeAspectId, setActiveAspectId] = useState<string>(INITIAL_ASPECTS[0].id);
  const [aspects, setAspects] = useState<BehaviourAspect[]>(INITIAL_ASPECTS);

  const activeAspect = useMemo(
    () => aspects.find((a) => a.id === activeAspectId) ?? aspects[0],
    [activeAspectId, aspects]
  );

  const ratedCount = useMemo(() => aspects.filter((a) => a.rating !== 0).length, [aspects]);
  const totalRawScore = useMemo(() => aspects.reduce((sum, a) => sum + a.rating, 0), [aspects]);

  const updateAspectRating = useCallback((aspectId: string, rating: number) => {
    setAspects((prev) => prev.map((a) => (a.id === aspectId ? { ...a, rating } : a)));
  }, []);

  const toggleReason = useCallback((aspectId: string, reason: string) => {
    setAspects((prev) =>
      prev.map((aspect) => {
        if (aspect.id !== aspectId) return aspect;

        const existing = aspect.reasons ?? [];
        if (existing.includes(reason)) {
          return { ...aspect, reasons: existing.filter((r) => r !== reason) };
        }
        if (existing.length >= MAX_REASON_SELECTION) {
          Alert.alert('Limit reached', `You can select up to ${MAX_REASON_SELECTION} reasons per aspect.`);
          return aspect;
        }
        return { ...aspect, reasons: [...existing, reason] };
      })
    );
  }, []);

  const updateNote = useCallback((aspectId: string, note: string) => {
    setAspects((prev) => prev.map((a) => (a.id === aspectId ? { ...a, note } : a)));
  }, []);

  const handleVoicePress = useCallback((aspectName: string) => {
    Alert.alert('Voice note', `Voice recording for ${aspectName} will be connected next.`);
  }, []);

  const handleSubmit = useCallback(() => {
    if (ratedCount === 0) {
      Alert.alert('Rating required', 'Please rate at least one aspect before submitting.');
      return;
    }
    Alert.alert('Saved', 'Ratings submitted successfully.');
  }, [ratedCount]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: scrollBottomPad }}
      >
        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <Card variant="elevated" style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroEyebrow}>Daily Behaviour Rating</Text>
                <View style={styles.childRow}>
                  <Text style={styles.childName}>{selectedChild}</Text>
                  <Icon name="arrow-drop-down" size={20} color={colors.textSecondary} />
                </View>
              </View>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeLabel}>Rated</Text>
                <Text style={styles.progressBadgeValue}>{ratedCount}/5</Text>
              </View>
            </View>
            <Text style={styles.heroSubtitle}>
              Select one aspect, apply score, choose up to 2 reasons, and add note/voice input.
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.aspectTabs}>
          {aspects.map((aspect) => {
            const selected = activeAspectId === aspect.id;
            return (
              <TouchableOpacity
                key={aspect.id}
                onPress={() => setActiveAspectId(aspect.id)}
                style={[styles.aspectTab, selected && styles.aspectTabSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Open ${aspect.name}`}
              >
                <Text style={[styles.aspectTabText, selected && styles.aspectTabTextSelected]}>
                  {aspect.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeAspect ? (
          <AspectPanel
            aspect={activeAspect}
            onRatingChange={updateAspectRating}
            onReasonToggle={toggleReason}
            onNoteChange={updateNote}
            onVoicePress={handleVoicePress}
          />
        ) : null}

        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <Card variant="elevated" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Quick Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Raw score total</Text>
              <Text style={[styles.summaryValue, { color: totalRawScore >= 0 ? colors.growth : colors.error }]}>
                {totalRawScore > 0 ? `+${totalRawScore}` : totalRawScore}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Aspects rated</Text>
              <Text style={styles.summaryValue}>{ratedCount}/5</Text>
            </View>
          </Card>
        </Animated.View>

        <Button title="Submit Rating" onPress={handleSubmit} style={styles.submitButton} />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heroCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.lavenderSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(124, 106, 232, 0.18)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroEyebrow: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  childName: {
    ...textStyles.headingMedium,
    marginRight: spacing.xs,
  },
  progressBadge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  progressBadgeLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  progressBadgeValue: {
    ...textStyles.headingMedium,
    color: colors.ink,
  },
  heroSubtitle: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  aspectTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  aspectTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  aspectTabSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  aspectTabText: {
    ...textStyles.caption,
    color: colors.ink,
    fontWeight: '700',
  },
  aspectTabTextSelected: {
    color: colors.surface,
  },
  aspectCard: {
    marginBottom: spacing.md,
  },
  aspectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  aspectTitleWrap: {
    flex: 1,
  },
  aspectName: {
    ...textStyles.headingLarge,
    fontSize: 22,
  },
  aspectDescription: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scoreBadge: {
    minWidth: 62,
    borderWidth: 1.5,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
  },
  scoreBadgeText: {
    ...textStyles.headingMedium,
    fontWeight: '700',
  },
  sectionLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ratingChip: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  ratingChipTitle: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
  },
  ratingChipScore: {
    ...textStyles.bodyLarge,
    marginTop: 2,
    fontWeight: '700',
  },
  reasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reasonHint: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  reasonGroupTitle: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  counterText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  noteArea: {
    marginBottom: spacing.md,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 92,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  voiceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.sm,
  },
  voiceButtonText: {
    ...textStyles.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...textStyles.headingMedium,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...textStyles.headingMedium,
    color: colors.ink,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
});

export default RatingScreen;
