import { TextStyle, Platform } from 'react-native';

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
    xxl: 22,
    xxxl: 24,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const textStyles: Record<string, TextStyle> = {
  headingLarge: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: '600' as const,
    lineHeight: typography.lineHeight.tight,
    color: '#1F2937',
  },
  
  headingMedium: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '600' as const,
    lineHeight: typography.lineHeight.tight,
    color: '#1F2937',
  },
  
  bodyLarge: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '400' as const,
    lineHeight: typography.lineHeight.normal,
    color: '#1F2937',
  },
  
  bodyMedium: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '400' as const,
    lineHeight: typography.lineHeight.normal,
    color: '#6B7280',
  },
  
  caption: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '400' as const,
    lineHeight: typography.lineHeight.normal,
    color: '#6B7280',
  },
  
  button: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '500' as const,
    lineHeight: typography.lineHeight.normal,
  },
};
