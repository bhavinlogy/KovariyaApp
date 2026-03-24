import React, { useCallback } from 'react';
import {
  Text,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, textStyles } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  hapticOnPress?: boolean;
}

export const Button = React.memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  hapticOnPress = true,
}: ButtonProps) {
  const handlePress = useCallback(() => {
    if (disabled || loading) {
      return;
    }
    if (hapticOnPress && (variant === 'primary' || variant === 'secondary')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [disabled, loading, hapticOnPress, variant, onPress]);

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.large,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyle = getSizeStyle();
    const variantStyle = getVariantStyle();

    return { ...baseStyle, ...sizeStyle, ...variantStyle };
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          minHeight: 40,
        };
      case 'large':
        return {
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          minHeight: 56,
        };
      default:
        return {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          minHeight: 48,
        };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    if (disabled) {
      return {
        backgroundColor: colors.surfaceMuted,
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.mintSoft,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.ink,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.ink,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = {
      ...textStyles.button,
      textAlign: 'center' as const,
    };

    if (disabled) {
      return {
        ...baseStyle,
        color: colors.textMuted,
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.growth,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: colors.ink,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: colors.primary,
        };
      default:
        return {
          ...baseStyle,
          color: colors.surface,
        };
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        getButtonStyle(),
        style,
        pressed && !disabled && !loading ? styles.pressed : null,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} size="small" />
      ) : (
        <>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    marginVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    marginRight: spacing.xs,
  },
});
