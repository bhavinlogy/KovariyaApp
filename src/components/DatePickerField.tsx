import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, textStyles, typography } from '../theme';
import { formatAppDate } from '../utils/dateFormat';
import { toIsoDate } from '../utils/age';

type DatePickerFieldProps = {
  label: string;
  valueIso: string | undefined;
  onChangeIso: (iso: string) => void;
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
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

/**
 * Stacked label + tappable field (matches InputField spacing).
 */
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
}: DatePickerFieldProps) {
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [iosDraft, setIosDraft] = useState<Date>(() => parseIsoToLocalDate(valueIso));

  const display = useMemo(() => {
    if (!valueIso || valueIso.length < 10) {
      return null;
    }
    return formatAppDate(valueIso.slice(0, 10));
  }, [valueIso]);

  const pickerActive = showAndroid || showIOS;

  const openPicker = useCallback(() => {
    setIosDraft(parseIsoToLocalDate(valueIso));
    if (Platform.OS === 'android') {
      setShowAndroid(true);
    } else {
      setShowIOS(true);
    }
  }, [valueIso]);

  const onAndroidChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      setShowAndroid(false);
      if (event.type === 'dismissed' || !date) {
        return;
      }
      onChangeIso(toIsoDate(date));
    },
    [onChangeIso]
  );

  const confirmIos = useCallback(() => {
    onChangeIso(toIsoDate(iosDraft));
    setShowIOS(false);
  }, [iosDraft, onChangeIso]);

  const cancelIos = useCallback(() => {
    setShowIOS(false);
  }, []);

  const onIosChange = useCallback((_e: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setIosDraft(date);
    }
  }, []);

  const maxD = maximumDate ?? new Date();
  const minD = minimumDate ?? new Date(1900, 0, 1);

  return (
    <View style={containerStyle}>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [
          styles.fieldBox,
          error ? styles.fieldBoxError : null,
          (pressed || pickerActive) && !error ? styles.fieldBoxFocused : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {leftIcon ? <View style={styles.leftIconWrap}>{leftIcon}</View> : null}
        <View style={styles.valueRow}>
          <Text
            style={[styles.valueText, !display ? styles.placeholder : null]}
            numberOfLines={1}
          >
            {display ?? placeholder}
          </Text>
          <Icon name="calendar-today" size={20} color={colors.textMuted} />
        </View>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {showAndroid ? (
        <DateTimePicker
          value={parseIsoToLocalDate(valueIso)}
          mode="date"
          display="default"
          onChange={onAndroidChange}
          minimumDate={minD}
          maximumDate={maxD}
        />
      ) : null}

      <Modal visible={showIOS} animationType="slide" presentationStyle="pageSheet" onRequestClose={cancelIos}>
        <SafeAreaView style={styles.iosSheet} edges={['top', 'left', 'right']}>
          <View style={styles.iosToolbar}>
            <Pressable onPress={cancelIos} style={styles.iosToolbarBtn}>
              <Text style={styles.iosToolbarCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.iosToolbarTitle} numberOfLines={1}>
              {label}
            </Text>
            <Pressable onPress={confirmIos} style={styles.iosToolbarBtn}>
              <Text style={styles.iosToolbarDone}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.iosPickerWrap}>
            <DateTimePicker
              value={iosDraft}
              mode="date"
              display="spinner"
              onChange={onIosChange}
              minimumDate={minD}
              maximumDate={maxD}
            />
          </View>
        </SafeAreaView>
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
  iosSheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  iosToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  iosToolbarBtn: {
    minWidth: 72,
    paddingVertical: spacing.sm,
  },
  iosToolbarCancel: {
    ...textStyles.bodyLarge,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  iosToolbarTitle: {
    ...textStyles.caption,
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
    lineHeight: 20,
  },
  iosToolbarDone: {
    ...textStyles.bodyLarge,
    color: colors.primary,
    fontWeight: '800',
    textAlign: 'right',
  },
  iosPickerWrap: {
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
});
