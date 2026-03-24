import React, { useCallback, useState, memo, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Button, Chip } from '../components';
import { colors, spacing, textStyles, getFloatingTabBarBottomPadding } from '../theme';
import { BehaviourAspect } from '../types';

const REASON_OPTIONS = [
  'Great effort',
  'Needs improvement',
  'Consistent behavior',
  'Showed growth',
  'Helped others',
  'Completed task',
  'Good attitude',
  'Worked hard',
] as const;

const INITIAL_ASPECTS: BehaviourAspect[] = [
  {
    id: '1',
    name: 'Communication',
    description: 'How well they express themselves and listen to others',
    rating: 0,
    reasons: [],
    note: '',
  },
  {
    id: '2',
    name: 'Responsibility',
    description: 'Completing tasks and being accountable',
    rating: 0,
    reasons: [],
    note: '',
  },
  {
    id: '3',
    name: 'Kindness',
    description: 'Being considerate and helpful to others',
    rating: 0,
    reasons: [],
    note: '',
  },
  {
    id: '4',
    name: 'Honesty',
    description: 'Being truthful and sincere',
    rating: 0,
    reasons: [],
    note: '',
  },
  {
    id: '5',
    name: 'Respect',
    description: 'Treating others with courtesy and consideration',
    rating: 0,
    reasons: [],
    note: '',
  },
];

const RATING_SCALE = [-4, -2, 0, 2, 4] as const;

function getRatingColor(rating: number) {
  if (rating > 0) {
    return colors.growth;
  }
  if (rating < 0) {
    return colors.error;
  }
  return colors.textSecondary;
}

type BehaviourAspectCardProps = {
  aspect: BehaviourAspect;
  onRatingChange: (aspectId: string, rating: number) => void;
  onReasonToggle: (aspectId: string, reason: string) => void;
  onNoteChange: (aspectId: string, note: string) => void;
};

const BehaviourAspectCard = memo(function BehaviourAspectCard({
  aspect,
  onRatingChange,
  onReasonToggle,
  onNoteChange,
}: BehaviourAspectCardProps) {
  return (
    <Card variant="elevated" style={styles.aspectCard}>
      <View style={styles.aspectHeader}>
        <Text style={styles.aspectName}>{aspect.name}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`More info about ${aspect.name}`}
        >
          <Icon name="info-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.aspectDescription}>{aspect.description}</Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Rating</Text>
        <View style={styles.ratingScale}>
          {RATING_SCALE.map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.ratingButton,
                aspect.rating === value && styles.ratingButtonSelected,
                { borderColor: getRatingColor(value) },
              ]}
              onPress={() => onRatingChange(aspect.id, value)}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${value}`}
              accessibilityState={{ selected: aspect.rating === value }}
            >
              <Text style={[styles.ratingText, { color: getRatingColor(value) }]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.reasonsContainer}>
        <Text style={styles.reasonsLabel}>Reasons</Text>
        <View style={styles.chipsContainer}>
          {REASON_OPTIONS.map((reason) => (
            <Chip
              key={reason}
              label={reason}
              selected={aspect.reasons?.includes(reason) ?? false}
              onPress={() => onReasonToggle(aspect.id, reason)}
              variant="reason"
            />
          ))}
        </View>
      </View>

      <View style={styles.noteContainer}>
        <Text style={styles.noteLabel}>Additional Notes</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Add any specific observations..."
          value={aspect.note}
          onChangeText={(text) => onNoteChange(aspect.id, text)}
          multiline
          numberOfLines={3}
        />
      </View>
    </Card>
  );
});

const RatingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollBottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );
  const [selectedChild] = useState('Emma Johnson');
  const [aspects, setAspects] = useState<BehaviourAspect[]>(INITIAL_ASPECTS);

  const updateAspectRating = useCallback((aspectId: string, rating: number) => {
    setAspects((prev) =>
      prev.map((a) => (a.id === aspectId ? { ...a, rating } : a))
    );
  }, []);

  const toggleReason = useCallback((aspectId: string, reason: string) => {
    setAspects((prev) =>
      prev.map((aspect) => {
        if (aspect.id !== aspectId) {
          return aspect;
        }
        const reasons = aspect.reasons?.includes(reason)
          ? aspect.reasons.filter((r) => r !== reason)
          : [...(aspect.reasons ?? []), reason];
        return { ...aspect, reasons };
      })
    );
  }, []);

  const updateNote = useCallback((aspectId: string, note: string) => {
    setAspects((prev) =>
      prev.map((a) => (a.id === aspectId ? { ...a, note } : a))
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const hasRatings = aspects.some((aspect) => aspect.rating !== 0);
    if (!hasRatings) {
      Alert.alert('Rating Required', 'Please rate at least one behaviour aspect.');
      return;
    }

    Alert.alert('Success', 'Behaviour ratings submitted successfully!');
  }, [aspects]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: scrollBottomPad }}
      >
        <Card variant="elevated" style={styles.headerCard}>
          <View style={styles.childSelector}>
            <Text style={styles.childName}>{selectedChild}</Text>
            <Icon name="arrow-drop-down" size={24} color={colors.textSecondary} />
          </View>
          <Text style={styles.headerSubtitle}>
            Rate today's behaviour on a scale from -4 to +4
          </Text>
        </Card>

        {aspects.map((aspect) => (
          <BehaviourAspectCard
            key={aspect.id}
            aspect={aspect}
            onRatingChange={updateAspectRating}
            onReasonToggle={toggleReason}
            onNoteChange={updateNote}
          />
        ))}

        <Card variant="elevated" style={styles.voiceCard}>
          <Text style={styles.voiceTitle}>Voice Note (Optional)</Text>
          <TouchableOpacity
            style={styles.voiceButton}
            accessibilityRole="button"
            accessibilityLabel="Record voice note"
          >
            <Icon name="mic" size={24} color={colors.primary} />
            <Text style={styles.voiceButtonText}>Tap to record</Text>
          </TouchableOpacity>
        </Card>

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
    padding: spacing.sm,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  childSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  childName: {
    ...textStyles.headingMedium,
    marginRight: spacing.xs,
  },
  headerSubtitle: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
  },
  aspectCard: {
    marginBottom: spacing.md,
  },
  aspectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  aspectName: {
    ...textStyles.headingMedium,
  },
  aspectDescription: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.md,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  ratingContainer: {
    marginBottom: spacing.md,
  },
  ratingLabel: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  ratingScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  ratingButtonSelected: {
    backgroundColor: colors.lavenderSoft,
    borderColor: colors.primary,
  },
  ratingText: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
  },
  reasonsContainer: {
    marginBottom: spacing.md,
  },
  reasonsLabel: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noteContainer: {
    marginTop: spacing.md,
  },
  noteLabel: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  voiceCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  voiceTitle: {
    ...textStyles.bodyMedium,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  voiceButtonText: {
    ...textStyles.bodyMedium,
    marginLeft: spacing.sm,
    color: colors.primary,
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
});

export default RatingScreen;
