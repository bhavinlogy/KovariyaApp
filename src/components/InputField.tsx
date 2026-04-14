import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  TextStyle,
  ViewStyle,
  TextInputProps,
  Pressable,
} from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';

interface InputFieldProps extends TextInputProps {
  label?: React.ReactNode;
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const InputField = React.memo(function InputField({
  label,
  error,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...textInputProps
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getInputContainerStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: error
        ? colors.error
        : isFocused
          ? colors.primary
          : colors.border,
      borderRadius: borderRadius.large,
      paddingHorizontal: spacing.md,
      height: 56,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      ...textStyles.bodyLarge,
      color: colors.textPrimary,
      marginLeft: leftIcon ? spacing.sm : 0,
      marginRight: rightIcon ? spacing.sm : 0,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      ...textStyles.bodyMedium,
      color: error ? colors.error : colors.textSecondary,
      marginBottom: spacing.xs,
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      ...textStyles.caption,
      color: colors.error,
      marginTop: spacing.xs,
    };
  };

  return (
    <View style={style}>
      {label ? (typeof label === 'string' ? <Text style={getLabelStyle()}>{label}</Text> : label) : null}
      <View style={getInputContainerStyle()}>
        {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={{ padding: spacing.xs }}>
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error ? <Text style={getErrorStyle()}>{error}</Text> : null}
    </View>
  );
});
