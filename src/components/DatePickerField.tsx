import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius, textStyles } from '../theme';
import { formatAppDate } from '../utils/dateFormat';
import { toIsoDate } from '../utils/age';

type DatePickerFieldProps = {
  label?: string | React.ReactNode;
  valueIso: string | undefined;
  onChangeIso: (iso: string) => void;
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  children?: React.ReactNode;
};

function parseIsoToLocalDate(iso: string | undefined): Date {
  if (!iso || iso.length < 10) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 8);
    return d;
  }
  const t = Date.parse(`${iso.slice(0, 10)}T12:00:00`);
  return Number.isNaN(t) ? new Date() : new Date(t);
}

export const DatePickerField = React.memo(function DatePickerField({
  label,
  valueIso,
  onChangeIso,
  placeholder = 'Select date',
  error,
  leftIcon,
  containerStyle,
  minimumDate,
  maximumDate,
  children,
}: DatePickerFieldProps) {
  const [showModal, setShowModal] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() => parseIsoToLocalDate(valueIso));

  const display = useMemo(() => {
    if (!valueIso || valueIso.length < 10) {
      return null;
    }
    return formatAppDate(valueIso.slice(0, 10));
  }, [valueIso]);

  const openPicker = useCallback(() => {
    const initDate = parseIsoToLocalDate(valueIso);
    setDraftDate(initDate);
    setShowModal(true);
  }, [valueIso]);

  const confirmDate = useCallback(() => {
    onChangeIso(toIsoDate(draftDate));
    setShowModal(false);
  }, [draftDate, onChangeIso]);

  const cancelDate = useCallback(() => {
    setShowModal(false);
  }, []);

  const onDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowModal(false);
      if (event.type === 'set' && selectedDate) {
        setDraftDate(selectedDate);
        onChangeIso(toIsoDate(selectedDate));
      }
    } else {
      if (selectedDate) {
        setDraftDate(selectedDate);
      }
    }
  }, [onChangeIso]);

  const maxD = maximumDate ?? new Date();
  const minD = minimumDate ?? new Date(1900, 0, 1);

  return (
    <View style={containerStyle}>
      {label && typeof label === 'string' ? (
        <Text style={[styles.labelAbove, error ? styles.labelAboveError : null]}>
          {label}
        </Text>
      ) : label}

      {children ? (
        <Pressable onPress={openPicker}>{children}</Pressable>
      ) : (
        <Pressable
          onPress={openPicker}
          style={[
            styles.fieldBox,
            error ? styles.fieldBoxError : null,
            showModal && !error ? styles.fieldBoxFocused : null,
          ]}
        >
          {leftIcon ? <View style={styles.leftIconWrap}>{leftIcon}</View> : null}
          <View style={styles.valueRow}>
            <Text
              style={[styles.valueText, !display ? styles.placeholder : null]}
              numberOfLines={1}
            >
              {display ?? placeholder}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
          </View>
        </Pressable>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {Platform.OS === 'ios' && (
        <Modal transparent visible={showModal} animationType="fade" onRequestClose={cancelDate}>
          <Pressable style={styles.modalOverlay} onPress={cancelDate}>
            <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {typeof label === 'string' ? label : 'Select Date'}
                </Text>
              </View>

              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={draftDate}
                  mode="date"
                  display="inline"
                  onChange={onDateChange}
                  minimumDate={minD}
                  maximumDate={maxD}
                  textColor={colors.textPrimary}
                  accentColor={colors.primary}
                  design="compact"
                />
              </View>

              <View style={styles.cardFooter}>
                <Pressable onPress={cancelDate} style={styles.footerBtn} hitSlop={10}>
                  <Text style={styles.footerCancel}>Cancel</Text>
                </Pressable>
                <Pressable onPress={confirmDate} style={styles.footerBtnPrimary} hitSlop={10}>
                  <Text style={styles.footerDone}>Done</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {Platform.OS === 'android' && showModal && (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={minD}
          maximumDate={maxD}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  labelAbove: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
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
    height: 56,
  },
  fieldBoxFocused: {
    borderColor: colors.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  valueText: {
    ...textStyles.bodyLarge,
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

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  cardTitle: {
    ...textStyles.headingMedium,
    color: colors.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  footerBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
  },
  footerBtnPrimary: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  footerCancel: {
    ...textStyles.button,
    color: colors.textSecondary,
  },
  footerDone: {
    ...textStyles.button,
    color: colors.surface,
  },
  pickerWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
});
