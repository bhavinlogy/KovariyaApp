export { colors, type ColorKeys } from './colors';
export { typography, textStyles } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
