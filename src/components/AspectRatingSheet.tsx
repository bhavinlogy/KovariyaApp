import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import {
  colors,
  spacing,
  textStyles,
  borderRadius,
} from '../theme';
import {
  type RatingAspectDefinition,
  RATING_SCALE_OPTIONS,
  REASON_CHIPS_POSITIVE,
  REASON_CHIPS_NEGATIVE,
  MAX_REASON_CHIPS,
  type AspectRatingPayload,
} from '../data/aspectRating';
import { useToast } from '../context/ToastContext';

type Props = {
  visible: boolean;
  aspect: RatingAspectDefinition | null;
  onClose: () => void;
  onSave: (payload: AspectRatingPayload) => void;
  onVoiceNotePress?: () => void;
};

export const AspectRatingSheet = React.memo(function AspectRatingSheet({
  visible,
  aspect,
  onClose,
  onSave,
  onVoiceNotePress,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { showToast } = useToast();
  const scaleBtnWidth = useMemo(() => {
    const sheetPad = spacing.lg * 2;
    const gap = spacing.sm;
    const inner = windowWidth - sheetPad;
    return Math.max(120, Math.floor((inner - gap) / 2));
  }, [windowWidth]);
  const [scale, setScale] = useState<number | null>(null);
  const [reasonIds, setReasonIds] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible && aspect) {
      setScale(null);
      setReasonIds([]);
      setNote('');
    }
  }, [visible, aspect?.id]);

  const toggleReason = useCallback(
    (id: string) => {
      setReasonIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        }
        if (prev.length >= MAX_REASON_CHIPS) {
          showToast({
            type: 'error',
            message: 'You can pick up to two reasons — remove one to choose another.',
            durationMs: 3200,
          });
          return prev;
        }
        return [...prev, id];
      });
    },
    [showToast]
  );

  const handleSave = useCallback(() => {
    if (!aspect || scale === null) {
      return;
    }
    onSave({
      aspectId: aspect.id,
      scale,
      reasonIds,
      note: note.trim(),
    });
  }, [aspect, scale, reasonIds, note, onSave]);

  const canSave = aspect != null && scale !== null;

  const title = useMemo(
    () => (aspect ? `${aspect.name} · How was behaviour today?` : ''),
    [aspect]
  );

  if (!aspect) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
          style={styles.kb}
        >
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              maxHeight: '92%',
            },
          ]}
        >
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.sheetHint}>Pick one rating, up to two reasons, then save.</Text>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text style={styles.blockLabel}>Rating</Text>
            <View style={styles.scaleGrid}>
              {RATING_SCALE_OPTIONS.map((opt) => {
                const selected = scale === opt.value;
                const neg = opt.tier === 'negative';
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setScale(opt.value)}
                    style={[
                      styles.scaleBtn,
                      { width: scaleBtnWidth },
                      neg ? styles.scaleBtnNegBase : styles.scaleBtnPosBase,
                      selected && (neg ? styles.scaleBtnNegSelected : styles.scaleBtnPosSelected),
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${opt.label}, ${opt.value >= 0 ? '+' : ''}${opt.value} points`}
                  >
                    <View style={styles.scaleBtnTextCol}>
                      <Text
                        style={[
                          styles.scaleBtnLabel,
                          neg ? styles.scaleBtnLabelNeg : styles.scaleBtnLabelPos,
                        ]}
                        numberOfLines={2}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        style={[
                          styles.scalePoints,
                          neg ? styles.scalePointsNeg : styles.scalePointsPos,
                        ]}
                      >
                        {opt.value >= 0 ? `+${opt.value}` : `${opt.value}`} pts
                      </Text>
                    </View>
                    {selected ? (
                      <Icon name="check-circle" size={22} color={neg ? '#B91C1C' : '#15803D'} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.blockLabel}>
              Reasons <Text style={styles.reasonCount}>({reasonIds.length}/{MAX_REASON_CHIPS})</Text>
            </Text>
            <Text style={styles.reasonHint}>Positive</Text>
            <View style={styles.chipWrap}>
              {REASON_CHIPS_POSITIVE.map((c) => {
                const on = reasonIds.includes(c.id);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => toggleReason(c.id)}
                    style={[styles.chip, styles.chipPos, on && styles.chipPosOn]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]} numberOfLines={1}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.reasonHint}>Needs work</Text>
            <View style={styles.chipWrap}>
              {REASON_CHIPS_NEGATIVE.map((c) => {
                const on = reasonIds.includes(c.id);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => toggleReason(c.id)}
                    style={[styles.chip, styles.chipNeg, on && styles.chipNegOn]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                  >
                    <Text style={[styles.chipTextNeg, on && styles.chipTextNegOn]} numberOfLines={1}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.blockLabel}>Add note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Anything else to remember…"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            <Pressable
              style={styles.voiceRow}
              onPress={onVoiceNotePress}
              accessibilityRole="button"
              accessibilityLabel="Record voice note"
            >
              <Icon name="mic" size={22} color={colors.primary} />
              <Text style={styles.voiceText}>Record voice note (optional)</Text>
              <Icon name="chevron-right" size={22} color={colors.textMuted} />
            </Pressable>
          </ScrollView>

          <Button
            title="Save"
            variant="primary"
            onPress={handleSave}
            disabled={!canSave}
            style={styles.saveBtn}
          />
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  kb: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 13, 0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...textStyles.headingMedium,
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  sheetHint: {
    ...textStyles.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  scroll: {
    maxHeight: 440,
  },
  blockLabel: {
    ...textStyles.caption,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  reasonCount: {
    fontWeight: '700',
    color: colors.primary,
  },
  reasonHint: {
    ...textStyles.caption,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  scaleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.sm,
    marginBottom: spacing.md,
  },
  scaleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.large,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  scaleBtnNegBase: {
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  scaleBtnPosBase: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  scaleBtnNegSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  scaleBtnPosSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    borderWidth: 2,
  },
  scaleBtnTextCol: {
    flex: 1,
    minWidth: 0,
  },
  scaleBtnLabel: {
    ...textStyles.bodyLarge,
    fontWeight: '700',
    fontSize: 15,
  },
  scaleBtnLabelNeg: {
    color: '#991B1B',
  },
  scaleBtnLabelPos: {
    color: '#166534',
  },
  scalePoints: {
    ...textStyles.caption,
    fontWeight: '800',
    marginTop: 4,
  },
  scalePointsNeg: {
    color: '#B91C1C',
  },
  scalePointsPos: {
    color: '#15803D',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipPos: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipPosOn: {
    backgroundColor: colors.growthLight,
    borderColor: colors.growth,
  },
  chipNeg: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipNegOn: {
    backgroundColor: 'rgba(232, 93, 93, 0.12)',
    borderColor: colors.error,
  },
  chipText: {
    ...textStyles.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipTextOn: {
    color: colors.ink,
  },
  chipTextNeg: {
    ...textStyles.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextNegOn: {
    color: colors.error,
    fontWeight: '700',
  },
  noteInput: {
    ...textStyles.bodyMedium,
    minHeight: 88,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.sm,
    color: colors.ink,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.large,
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.md,
  },
  voiceText: {
    ...textStyles.bodyLarge,
    flex: 1,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  saveBtn: {
    marginTop: spacing.xs,
  },
});
