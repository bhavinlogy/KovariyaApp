import { TextStyle, Platform } from 'react-native';
import { colors } from './colors';

export const typography = {
  fontFamily: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    fallback: 'System',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 26,
    normal: 22,
    relaxed: 24,
    loose: 30,
  },
};

export const textStyles: Record<string, TextStyle> = {
  hero: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
    color: colors.textPrimary,
  },

  headingLarge: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: '600',
    lineHeight: typography.lineHeight.loose,
    color: colors.textPrimary,
  },

  headingMedium: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    lineHeight: typography.lineHeight.tight,
    color: colors.textPrimary,
  },

  bodyLarge: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '400',
    lineHeight: typography.lineHeight.relaxed,
    color: colors.textPrimary,
  },

  bodyMedium: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: typography.lineHeight.normal,
    color: colors.textSecondary,
  },

  caption: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '400',
    lineHeight: typography.lineHeight.normal,
    color: colors.textMuted,
  },

  button: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    lineHeight: typography.lineHeight.relaxed,
  },
};
