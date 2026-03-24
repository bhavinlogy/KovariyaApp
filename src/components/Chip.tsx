import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'default' | 'filter' | 'reason';
}

export const Chip = React.memo(function Chip({
  label,
  selected = false,
  onPress,
  style,
  textStyle,
  variant = 'default',
}: ChipProps) {
  const getChipStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    };

    switch (variant) {
      case 'filter':
        return {
          ...baseStyle,
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        };
      case 'reason':
        return {
          ...baseStyle,
          backgroundColor: selected ? colors.growthLight : colors.surface,
          borderColor: selected ? colors.growth : colors.border,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: selected ? colors.primaryLight : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = {
      ...textStyles.caption,
      fontWeight: '500' as const,
    };

    switch (variant) {
      case 'filter':
        return {
          ...baseStyle,
          color: selected ? '#FFFFFF' : colors.textSecondary,
        };
      case 'reason':
        return {
          ...baseStyle,
          color: selected ? colors.growth : colors.textSecondary,
        };
      default:
        return {
          ...baseStyle,
          color: selected ? colors.primary : colors.textSecondary,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.chip, getChipStyle(), style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
  },
});
