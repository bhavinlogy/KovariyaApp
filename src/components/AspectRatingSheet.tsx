import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  shadows,
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

const NEXT_STEP_TOOLTIP_MS = 4000;
const NEXT_STEP_POPOVER_ESTIMATE_H = 48;
const NEXT_STEP_POPOVER_GAP = 8;
const NEXT_STEP_POPOVER_MAX_W = 280;

type Props = {
  visible: boolean;
  aspect: RatingAspectDefinition | null;
  onClose: () => void;
  /** Persists a log; sheet stays open and the form resets so another entry can be added. */
  onSave: (payload: AspectRatingPayload) => void;
  /** Same order as on the dashboard — used for “step” copy and Save & next. */
  orderedAspects?: RatingAspectDefinition[];
  /** When provided with a following aspect in `orderedAspects`, enables seamless handoff after save. */
  onSaveAndNext?: (payload: AspectRatingPayload) => void;
  onVoiceNotePress?: () => void;
};

export const AspectRatingSheet = React.memo(function AspectRatingSheet({
  visible,
  aspect,
  onClose,
  onSave,
  orderedAspects,
  onSaveAndNext,
  onVoiceNotePress,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { showToast } = useToast();
  const scaleBtnWidth = useMemo(() => {
    const sheetPad = spacing.lg * 2;
    const gap = spacing.sm;
    const inner = windowWidth - sheetPad;
    // 2 columns × 3 rows for the six rating scale options.
    return Math.max(140, Math.floor((inner - gap) / 2));
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

  const resetForm = useCallback(() => {
    setScale(null);
    setReasonIds([]);
    setNote('');
  }, []);

  const buildPayload = useCallback((): AspectRatingPayload | null => {
    if (!aspect || scale === null) {
      return null;
    }
    return {
      aspectId: aspect.id,
      scale,
      reasonIds,
      note: note.trim(),
    };
  }, [aspect, scale, reasonIds, note]);

  const handleSaveEntry = useCallback(() => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    onSave(payload);
    resetForm();
  }, [buildPayload, onSave, resetForm]);

  const handleSaveAndNext = useCallback(() => {
    const payload = buildPayload();
    if (!payload || !onSaveAndNext) {
      return;
    }
    onSaveAndNext(payload);
  }, [buildPayload, onSaveAndNext]);

  const canSave = aspect != null && scale !== null;

  const aspectStepLabel = useMemo(() => {
    if (!aspect || !orderedAspects?.length) {
      return null;
    }
    const i = orderedAspects.findIndex((a) => a.id === aspect.id);
    if (i < 0) {
      return null;
    }
    return `Step ${i + 1} of ${orderedAspects.length}`;
  }, [aspect, orderedAspects]);

  const nextAspect = useMemo(() => {
    if (!aspect || !orderedAspects?.length) {
      return null;
    }
    const i = orderedAspects.findIndex((a) => a.id === aspect.id);
    if (i < 0 || i >= orderedAspects.length - 1) {
      return null;
    }
    return orderedAspects[i + 1];
  }, [aspect, orderedAspects]);

  const showSaveAndNext = Boolean(nextAspect && onSaveAndNext);

  const prevAspectIdForTooltipRef = useRef<string | null>(null);
  const tooltipHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveNextAnchorRef = useRef<View | null>(null);
  const [nextStepTooltipLabel, setNextStepTooltipLabel] = useState<string | null>(null);
  const [nextStepPopoverPos, setNextStepPopoverPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const measureNextStepPopover = useCallback(() => {
    saveNextAnchorRef.current?.measureInWindow((x, y, w, h) => {
      const popoverW = Math.min(NEXT_STEP_POPOVER_MAX_W, windowWidth - spacing.lg * 2);
      let left = x + w / 2 - popoverW / 2;
      const pad = spacing.md;
      left = Math.max(pad, Math.min(left, windowWidth - popoverW - pad));
      let top = y - NEXT_STEP_POPOVER_ESTIMATE_H - NEXT_STEP_POPOVER_GAP;
      if (top < insets.top + pad) {
        top = y + h + NEXT_STEP_POPOVER_GAP;
      }
      setNextStepPopoverPos({ top, left, width: popoverW });
    });
  }, [insets.top, windowWidth]);

  useEffect(() => {
    if (!visible) {
      prevAspectIdForTooltipRef.current = null;
      setNextStepTooltipLabel(null);
      setNextStepPopoverPos(null);
      if (tooltipHideTimerRef.current) {
        clearTimeout(tooltipHideTimerRef.current);
        tooltipHideTimerRef.current = null;
      }
      return;
    }
    if (!aspect) {
      return;
    }

    const prevId = prevAspectIdForTooltipRef.current;
    prevAspectIdForTooltipRef.current = aspect.id;

    if (prevId === null) {
      return;
    }
    if (prevId === aspect.id) {
      return;
    }

    if (nextAspect?.name) {
      setNextStepTooltipLabel(nextAspect.name);
      if (tooltipHideTimerRef.current) {
        clearTimeout(tooltipHideTimerRef.current);
      }
      tooltipHideTimerRef.current = setTimeout(() => {
        setNextStepTooltipLabel(null);
        setNextStepPopoverPos(null);
        tooltipHideTimerRef.current = null;
      }, NEXT_STEP_TOOLTIP_MS);
    }
  }, [visible, aspect?.id, nextAspect?.name]);

  useEffect(() => {
    if (!nextStepTooltipLabel || !showSaveAndNext) {
      setNextStepPopoverPos(null);
      return;
    }
    const id = requestAnimationFrame(() => {
      measureNextStepPopover();
    });
    return () => cancelAnimationFrame(id);
  }, [nextStepTooltipLabel, showSaveAndNext, measureNextStepPopover, aspect?.id]);

  const title = useMemo(
    () => (aspect ? `${aspect.name} · How was behaviour today?` : ''),
    [aspect]
  );

  if (!aspect) {
    return null;
  }

  const showNextStepPopoverModal = Boolean(
    nextStepTooltipLabel && nextStepPopoverPos && showSaveAndNext
  );

  return (
    <>
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
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle} numberOfLines={2}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}
            >
              <Icon name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>
          {aspectStepLabel ? (
            <Text style={styles.sheetStep}>{aspectStepLabel}</Text>
          ) : null}
          <Text style={styles.sheetHint}>
            Select a rating. scroll down to add reasons. You can log this multiple times today.
          </Text>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text style={styles.blockLabel}>Rating</Text>
            <Text style={styles.ratingHint}>Tap a score to choose points</Text>
            <View style={styles.scaleGrid}>
              {RATING_SCALE_OPTIONS.map((opt) => {
                const selected = scale === opt.value;
                const neg = opt.tier === 'negative';
                const ripple = neg
                  ? { color: 'rgba(220, 38, 38, 0.18)', borderless: false }
                  : { color: 'rgba(22, 163, 74, 0.18)', borderless: false };
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setScale(opt.value)}
                    android_ripple={ripple}
                    style={({ pressed }) => [
                      styles.scaleBtn,
                      { width: scaleBtnWidth },
                      neg ? styles.scaleBtnNegBase : styles.scaleBtnPosBase,
                      selected && (neg ? styles.scaleBtnNegSelected : styles.scaleBtnPosSelected),
                      pressed && styles.scaleBtnPressed,
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
                    {/* {selected ? (
                      <Icon name="check-circle" size={22} color={neg ? '#B91C1C' : '#15803D'} />
                    ) : (
                      <Icon name="touch-app" size={20} color={neg ? 'rgba(153, 27, 27, 0.45)' : 'rgba(22, 101, 52, 0.45)'} />
                    )} */}
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
                    android_ripple={{ color: 'rgba(22, 163, 74, 0.14)', borderless: false }}
                    style={({ pressed }) => [
                      styles.chip,
                      styles.chipPos,
                      on && styles.chipPosOn,
                      pressed && styles.chipPressed,
                    ]}
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
                    android_ripple={{ color: 'rgba(220, 38, 38, 0.14)', borderless: false }}
                    style={({ pressed }) => [
                      styles.chip,
                      styles.chipNeg,
                      on && styles.chipNegOn,
                      pressed && styles.chipPressed,
                    ]}
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
              placeholder="Other reason or extra notes."
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            {onVoiceNotePress ? (
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
            ) : null}
          </ScrollView>

          <View style={styles.saveFooter}>
            {showSaveAndNext && nextAspect ? (
              <View style={styles.saveFooterRow}>
                <View style={styles.saveFooterHalf}>
                  <Button
                    title="Save"
                    variant="primary"
                    size="small"
                    onPress={handleSaveEntry}
                    disabled={!canSave}
                    style={styles.footerPrimaryBtn}
                  />
                </View>
                <View style={styles.saveFooterHalf}>
                  <View
                    ref={saveNextAnchorRef}
                    collapsable={false}
                    style={styles.saveNextAnchor}
                    onLayout={() => {
                      if (nextStepTooltipLabel) {
                        measureNextStepPopover();
                      }
                    }}
                  >
                    <Button
                      title="Save & Next"
                      variant="outline"
                      size="small"
                      onPress={handleSaveAndNext}
                      disabled={!canSave}
                      style={styles.footerSecondaryBtn}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <Button
                title="Save entry"
                variant="primary"
                size="small"
                onPress={handleSaveEntry}
                disabled={!canSave}
                style={styles.footerPrimaryBtnFull}
              />
            )}
          </View>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>

    <Modal
      visible={showNextStepPopoverModal}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={() => {
        setNextStepTooltipLabel(null);
        setNextStepPopoverPos(null);
        if (tooltipHideTimerRef.current) {
          clearTimeout(tooltipHideTimerRef.current);
          tooltipHideTimerRef.current = null;
        }
      }}
    >
      <View style={styles.nextStepPopoverModalRoot} pointerEvents="box-none">
        {nextStepTooltipLabel && nextStepPopoverPos ? (
          <View
            style={[
              styles.nextStepPopoverModal,
              {
                top: nextStepPopoverPos.top,
                left: nextStepPopoverPos.left,
                width: nextStepPopoverPos.width,
              },
            ]}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
            accessibilityLabel={`Next step: ${nextStepTooltipLabel}`}
          >
            <Text style={styles.nextStepPopoverText}>
              Next:{' '}
              <Text style={styles.nextStepPopoverName}>{nextStepTooltipLabel}</Text>
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
    </>
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
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    ...textStyles.headingMedium,
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  closeButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.xs,
    marginRight: -spacing.xs,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.small,
  },
  closeButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  sheetStep: {
    ...textStyles.caption,
    fontWeight: '700',
    color: colors.primary,
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
  ratingHint: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
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
    minHeight: 76,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  scaleBtnPressed: {
    opacity: Platform.OS === 'ios' ? 0.9 : 1,
    transform: [{ scale: 0.98 }],
  },
  scaleBtnNegBase: {
    ...shadows.small,
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(252, 165, 165, 0.85)',
  },
  scaleBtnPosBase: {
    ...shadows.small,
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(134, 239, 172, 0.9)',
  },
  scaleBtnNegSelected: {
    ...shadows.small,
    backgroundColor: '#FEE2E2',
    borderColor: '#991B1B',
    borderWidth: 2.5,
  },
  scaleBtnPosSelected: {
    ...shadows.small,
    backgroundColor: '#DCFCE7',
    borderColor: '#166534',
    borderWidth: 2.5,
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
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipPos: {
    ...shadows.small,
    backgroundColor: '#EEF6F0',
    borderColor: 'rgba(22, 163, 74, 0.22)',
  },
  chipPosOn: {
    backgroundColor: '#DCFCE7',
    borderColor: '#166534',
    borderWidth: 1.5,
  },
  chipNeg: {
    ...shadows.small,
    backgroundColor: '#F9F2F2',
    borderColor: 'rgba(232, 93, 93, 0.28)',
  },
  chipNegOn: {
    backgroundColor: '#F9F2F2',
    borderColor: '#991B1B',
    borderWidth: 1.5,
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
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
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
  saveFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  saveNextAnchor: {
    alignSelf: 'stretch',
  },
  nextStepPopoverModalRoot: {
    flex: 1,
  },
  nextStepPopoverModal: {
    position: 'absolute',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.large,
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  nextStepPopoverText: {
    ...textStyles.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: colors.surface,
    textAlign: 'center',
  },
  nextStepPopoverName: {
    fontWeight: '800',
    color: colors.surface,
  },
  saveFooterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  saveFooterHalf: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-end',
  },
  footerPrimaryBtn: {
    marginVertical: 0,
  },
  footerPrimaryBtnFull: {
    marginVertical: 0,
  },
  footerSecondaryBtn: {
    marginVertical: 0,
  },
});
