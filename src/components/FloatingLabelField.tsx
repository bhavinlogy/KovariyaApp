import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  ViewStyle,
  TextInputProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';

type FloatingLabelFieldProps = TextInputProps & {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

/**
 * Label stacked above the field (same pattern as InputField) — clear spacing, no label/value overlap.
 */
export const FloatingLabelField = React.memo(function FloatingLabelField({
  label,
  error,
  leftIcon,
  style: containerStyle,
  multiline,
  inputStyle,
  ...textInputProps
}: FloatingLabelFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {/* <Text style={[styles.labelAbove, error ? styles.labelAboveError : null]}>{label}</Text> */}
      <View
        style={[
          styles.fieldBox,
          multiline ? styles.fieldBoxMultiline : null,
          error ? styles.fieldBoxError : null,
          isFocused && !error ? styles.fieldBoxFocused : null,
        ]}
      >
        {leftIcon ? (
          <View style={[styles.leftIconWrap, multiline ? styles.leftIconWrapMultiline : null]}>
            {leftIcon}
          </View>
        ) : null}
        <TextInput
          style={[
            styles.input,
            multiline ? styles.inputMultiline : null,
            leftIcon ? styles.inputWithLeftIcon : null,
            inputStyle,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...textInputProps}
          placeholder={label}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  fieldBoxMultiline: {
    alignItems: 'flex-start',
    minHeight: 120,
    paddingVertical: spacing.md,
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
  leftIconWrapMultiline: {
    paddingTop: 2,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...textStyles.bodyLarge,
    color: colors.textPrimary,
    paddingVertical: 0,
    lineHeight: 22,
  },
  inputWithLeftIcon: {
    // margin handled by icon wrap
  },
  inputMultiline: {
    minHeight: 88,
    lineHeight: 22,
    paddingTop: 0,
  },
  error: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});
