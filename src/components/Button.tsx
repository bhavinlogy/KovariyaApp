import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
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
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.medium,
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
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          minHeight: 36,
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
        backgroundColor: colors.border,
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.growth,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.primary,
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
        color: colors.textSecondary,
      };
    }

    switch (variant) {
      case 'outline':
        return {
          ...baseStyle,
          color: colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: colors.primary,
        };
      default:
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} size="small" />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
});
