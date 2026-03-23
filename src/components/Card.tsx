import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { spacing, borderRadius, shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = spacing.md,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: '#FFFFFF',
      borderRadius: borderRadius.medium,
      padding,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.medium,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        };
      default:
        return baseStyle;
    }
  };

  return <View style={[styles.card, getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.xs,
  },
});
