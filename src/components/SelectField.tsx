import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius, textStyles } from '../theme';
import { GRADIENT_60_END } from '../theme/layout';

export type SelectOption = { value: string; label: string };

const OPTION_ROW_MIN = 52;
const HEADER_MIN = 76;

type SelectFieldProps = {
  label: string;
  value: string | undefined;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
};

/**
 * Stacked label + tappable field. Picker opens as a centered sheet with gradient header (Profile-style).
 */
export const SelectField = React.memo(function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  error,
  leftIcon,
  containerStyle,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label;
  }, [options, value]);

  const openSheet = useCallback(() => {
    setOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setOpen(false);
  }, []);

  const onPick = useCallback(
    (v: string) => {
      onChange(v);
      closeSheet();
    },
    [onChange, closeSheet]
  );

  const showPlaceholder = value === undefined || value === '';

  const { listMaxHeight, cardMaxHeight } = useMemo(() => {
    const h = Dimensions.get('window').height;
    const list = Math.min(h * 0.58, Math.max(options.length * OPTION_ROW_MIN + spacing.sm, OPTION_ROW_MIN));
    const card = Math.min(h * 0.88, HEADER_MIN + list + 8);
    return { listMaxHeight: list, cardMaxHeight: card };
  }, [options.length]);

  return (
    <View style={containerStyle}>
      <Text style={[styles.labelAbove, error ? styles.labelAboveError : null]}>{label}</Text>
      <Pressable
        onPress={openSheet}
        style={({ pressed: p }) => [
          styles.fieldBox,
          error ? styles.fieldBoxError : null,
          (p || open) && !error ? styles.fieldBoxFocused : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {leftIcon ? <View style={styles.leftIconWrap}>{leftIcon}</View> : null}
        <View style={styles.valueRow}>
          <Text
            style={[styles.valueText, showPlaceholder ? styles.placeholder : null]}
            numberOfLines={1}
          >
            {selectedLabel ?? placeholder}
          </Text>
          <Icon name="keyboard-arrow-down" size={22} color={colors.textMuted} />
        </View>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
        statusBarTranslucent={Platform.OS === 'android'}
        onRequestClose={closeSheet}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={closeSheet}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View style={styles.cardOuter} pointerEvents="box-none">
            <View style={[styles.card, { maxHeight: cardMaxHeight }]}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={GRADIENT_60_END}
                style={styles.gradientHeader}
              >
                <View style={styles.headerOrbs} pointerEvents="none">
                  <View style={styles.headerOrbLarge} />
                  <View style={styles.headerOrbMid} />
                  <View style={styles.headerOrbTiny} />
                </View>
                <View style={styles.sheetHeaderRow}>
                  <View style={styles.headerSide} />
                  <Text style={styles.sheetTitleOnGradient} numberOfLines={2}>
                    {label}
                  </Text>
                  <Pressable
                    onPress={closeSheet}
                    style={({ pressed: hp }) => [styles.closeOnGradient, hp && styles.closeOnGradientPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    hitSlop={8}
                  >
                    <Icon name="close" size={24} color="rgba(255,255,255,0.95)" />
                  </Pressable>
                </View>
              </LinearGradient>

              <ScrollView
                style={[styles.optionsScroll, { maxHeight: listMaxHeight }]}
                contentContainerStyle={styles.optionsContent}
                bounces={options.length * OPTION_ROW_MIN > listMaxHeight}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={options.length > 6}
              >
                {options.map((item, index) => {
                  const isSelected = item.value === value;
                  return (
                    <Pressable
                      key={`${item.value}-${index}`}
                      style={({ pressed: ip }) => [
                        styles.optionRow,
                        index < options.length - 1 && styles.optionRowDivider,
                        isSelected && styles.optionRowSelected,
                        ip && styles.optionRowPressed,
                      ]}
                      onPress={() => onPick(item.value)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {item.label}
                      </Text>
                      {isSelected ? (
                        <Icon name="check" size={22} color={colors.primary} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  labelAbove: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  labelAboveError: {
    color: colors.error,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.large,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  fieldBoxFocused: {
    borderColor: colors.ink,
  },
  fieldBoxError: {
    borderColor: colors.error,
  },
  leftIconWrap: {
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  valueRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 28,
  },
  valueText: {
    ...textStyles.bodyLarge,
    lineHeight: 22,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  error: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.inkOverlay,
  },
  cardOuter: {
    width: '100%',
    maxWidth: 420,
    zIndex: 1,
  },
  card: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  gradientHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  headerOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOrbLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    top: -80,
    right: -56,
  },
  headerOrbMid: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(232, 228, 255, 0.14)',
    bottom: 6,
    left: 8,
  },
  headerOrbTiny: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: 12,
    left: '32%',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    gap: spacing.sm,
  },
  headerSide: {
    width: 40,
    height: 40,
  },
  sheetTitleOnGradient: {
    flex: 1,
    textAlign: 'center',
    color: colors.surface,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  closeOnGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  closeOnGradientPressed: {
    opacity: 0.85,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  optionsScroll: {
    backgroundColor: colors.surface,
  },
  optionsContent: {
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: OPTION_ROW_MIN,
    backgroundColor: colors.surface,
  },
  optionRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionRowSelected: {
    backgroundColor: colors.lavenderSoft,
  },
  optionRowPressed: {
    opacity: 0.92,
  },
  optionText: {
    ...textStyles.bodyLarge,
    lineHeight: 22,
    color: colors.ink,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
