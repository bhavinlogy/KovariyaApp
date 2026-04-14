import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, textStyles, shadows } from '../theme';

const { height: SH } = Dimensions.get('window');
const SHEET_ANIM = { duration: 320, easing: Easing.out(Easing.cubic) };

interface CustomDatePickerProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
  title?: string;
}

export default function CustomDatePicker({
  visible,
  value,
  minimumDate,
  maximumDate,
  onDateChange,
  onClose,
  title = 'Date of Birth',
}: CustomDatePickerProps) {
  const [draftDate, setDraftDate] = useState(value);

  // ─── Android: show native dialog directly ──────────────────────────
  const [showAndroid, setShowAndroid] = useState(false);

  const sheetY = useSharedValue(SH);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setDraftDate(value);
      if (Platform.OS === 'android') {
        setShowAndroid(true);
      } else {
        sheetY.value = withTiming(0, SHEET_ANIM);
        overlayOpacity.value = withTiming(1, { duration: 250 });
      }
    } else {
      sheetY.value = withTiming(SH, SHEET_ANIM);
      overlayOpacity.value = withTiming(0, { duration: 200 });
      setShowAndroid(false);
    }
  }, [visible, value]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // ─── iOS: onChange updates draft only, confirm commits ──────────────
  const onIOSChange = useCallback((_: DateTimePickerEvent, date?: Date) => {
    if (date) setDraftDate(date);
  }, []);

  const handleConfirm = useCallback(() => {
    onDateChange(draftDate);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }, [draftDate, onDateChange, onClose]);

  // ─── Android: native dialog handles everything ─────────────────────
  const onAndroidChange = useCallback((event: DateTimePickerEvent, date?: Date) => {
    setShowAndroid(false);
    if (event.type === 'set' && date) {
      onDateChange(date);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  }, [onDateChange, onClose]);

  // ─── Android: just render the native picker (no modal wrapper) ─────
  if (Platform.OS === 'android') {
    if (!visible || !showAndroid) return null;
    return (
      <View style={{
        backgroundColor: '#1E1E2E',
        borderRadius: 16,
        padding: 12,
        marginHorizontal: 16,
      }}>

        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          onChange={onAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          accentColor={colors.primary}
          positiveButton={{ label: 'OK', textColor: colors.primary }}
          negativeButton={{ label: 'Cancel', textColor: colors.textSecondary }}
        />
      </View>
    );
  }

  // ─── iOS: bottom sheet matching GradeSheet style ───────────────────
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[s.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[s.sheet, sheetStyle]}>
          {/* Handle */}
          <View style={s.handleWrap}>
            <View style={s.handle} />
          </View>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>{title}</Text>
            <Pressable onPress={onClose} style={s.closeBtn} hitSlop={12}>
              <Icon name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Date Picker */}
          <View style={s.pickerWrap}>
            <DateTimePicker
              value={draftDate}
              mode="date"
              display="inline"
              onChange={onIOSChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              accentColor={colors.primary}
              textColor={colors.textPrimary}
              style={s.picker}
            />
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Pressable onPress={onClose} style={s.cancelBtn} hitSlop={10}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={s.confirmBtn} hitSlop={10}>
              <Text style={s.confirmText}>Confirm</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    ...shadows.large,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    ...textStyles.headingMedium,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  picker: {
    height: 340,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
  },
  cancelText: {
    ...textStyles.button,
    color: colors.textSecondary,
  },
  confirmBtn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    ...shadows.small,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
  },
  confirmText: {
    ...textStyles.button,
    color: colors.surface,
  },
});