import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Button, Chip } from '../components';
import { colors, spacing, textStyles } from '../theme';
import { BehaviourAspect } from '../types';

const RatingScreen: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState('Emma Johnson');
  const [aspects, setAspects] = useState<BehaviourAspect[]>([
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
  ]);

  const reasonOptions = [
    'Great effort',
    'Needs improvement',
    'Consistent behavior',
    'Showed growth',
    'Helped others',
    'Completed task',
    'Good attitude',
    'Worked hard',
  ];

  const updateAspectRating = (aspectId: string, rating: number) => {
    setAspects(prev =>
      prev.map(aspect =>
        aspect.id === aspectId ? { ...aspect, rating } : aspect
      )
    );
  };

  const toggleReason = (aspectId: string, reason: string) => {
    setAspects(prev =>
      prev.map(aspect => {
        if (aspect.id === aspectId) {
          const reasons = aspect.reasons?.includes(reason)
            ? aspect.reasons.filter(r => r !== reason)
            : [...(aspect.reasons || []), reason];
          return { ...aspect, reasons };
        }
        return aspect;
      })
    );
  };

  const updateNote = (aspectId: string, note: string) => {
    setAspects(prev =>
      prev.map(aspect =>
        aspect.id === aspectId ? { ...aspect, note } : aspect
      )
    );
  };

  const handleSubmit = () => {
    const hasRatings = aspects.some(aspect => aspect.rating !== 0);
    if (!hasRatings) {
      Alert.alert('Rating Required', 'Please rate at least one behaviour aspect.');
      return;
    }

    // Here you would submit the ratings to your API
    console.log('Submitting ratings:', aspects);
    Alert.alert('Success', 'Behaviour ratings submitted successfully!');
  };

  const getRatingColor = (rating: number) => {
    if (rating > 0) return colors.growth;
    if (rating < 0) return colors.error;
    return colors.textSecondary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Card variant="elevated" style={styles.headerCard}>
          <View style={styles.childSelector}>
            <Text style={styles.childName}>{selectedChild}</Text>
            <Icon name="arrow-drop-down" size={24} color={colors.textSecondary} />
          </View>
          <Text style={styles.headerSubtitle}>
            Rate today's behaviour on a scale from -4 to +4
          </Text>
        </Card>

        {/* Behaviour Aspects */}
        {aspects.map((aspect) => (
          <Card key={aspect.id} variant="elevated" style={styles.aspectCard}>
            <View style={styles.aspectHeader}>
              <Text style={styles.aspectName}>{aspect.name}</Text>
              <TouchableOpacity>
                <Icon name="info-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.aspectDescription}>{aspect.description}</Text>

            {/* Rating Scale */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating</Text>
              <View style={styles.ratingScale}>
                {[-4, -2, 0, 2, 4].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.ratingButton,
                      aspect.rating === value && styles.ratingButtonSelected,
                      { borderColor: getRatingColor(value) },
                    ]}
                    onPress={() => updateAspectRating(aspect.id, value)}
                  >
                    <Text
                      style={[
                        styles.ratingText,
                        { color: getRatingColor(value) },
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reason Chips */}
            <View style={styles.reasonsContainer}>
              <Text style={styles.reasonsLabel}>Reasons</Text>
              <View style={styles.chipsContainer}>
                {reasonOptions.map((reason) => (
                  <Chip
                    key={reason}
                    label={reason}
                    selected={aspect.reasons?.includes(reason) || false}
                    onPress={() => toggleReason(aspect.id, reason)}
                    variant="reason"
                  />
                ))}
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>Additional Notes</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Add any specific observations..."
                value={aspect.note}
                onChangeText={(text) => updateNote(aspect.id, text)}
                multiline
                numberOfLines={3}
              />
            </View>
          </Card>
        ))}

        {/* Voice Recording Section */}
        <Card variant="elevated" style={styles.voiceCard}>
          <Text style={styles.voiceTitle}>Voice Note (Optional)</Text>
          <TouchableOpacity style={styles.voiceButton}>
            <Icon name="mic" size={24} color={colors.primary} />
            <Text style={styles.voiceButtonText}>Tap to record</Text>
          </TouchableOpacity>
        </Card>

        {/* Submit Button */}
        <Button
          title="Submit Rating"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
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
  headerCard: {
    marginBottom: spacing.lg,
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
    marginBottom: spacing.lg,
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
    backgroundColor: colors.primaryLight,
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
    borderRadius: 12,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
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
