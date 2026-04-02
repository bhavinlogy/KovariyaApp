/**
 * Kovariya — calm wellness + premium (light).
 * Pastel accents inspired by modern fitness/wellness references; ink for contrast.
 */
export const colors = {
  // Core ink & neutrals
  ink: '#0D0D0D',
  background: '#F3F2F7',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEDF5',
  textPrimary: '#111111',
  textSecondary: '#6B6678',
  textMuted: '#9B95A8',
  border: 'rgba(17, 17, 17, 0.08)',
  borderStrong: 'rgba(17, 17, 17, 0.12)',

  // Pastel accents (reference palette)
  lavender: '#B8A9F9',
  lavenderSoft: '#E8E4FF',
  peach: '#FFC074',
  peachSoft: '#FFF0DC',
  mint: '#C1EAD1',
  mintSoft: '#E8F8EE',
  sky: '#B6D7FB',
  skySoft: '#E8F1FE',

  // Brand / interactive (lavender-forward)
  primary: '#7C6AE8',
  primaryDark: '#5E4FD4',
  growth: '#3FA97A',
  accent: '#E8A04A',

  // Semantic
  success: '#2FA87A',
  warning: '#E8A04A',
  error: '#E85D5D',
  info: '#6B8EF0',

  // Overlays & tints
  primaryLight: 'rgba(124, 106, 232, 0.12)',
  growthLight: 'rgba(63, 169, 122, 0.12)',
  accentLight: 'rgba(232, 160, 74, 0.14)',
  inkOverlay: 'rgba(13, 13, 13, 0.55)',

  // Tab bar (floating pill — deep navy shell + white active capsule)
  tabBarBackground: '#0A0D12',
  tabBarPillBorder: 'rgba(255, 255, 255, 0.06)',
  tabBarIconActive: '#0D0D0D',
  tabBarIconInactive: 'rgba(255, 255, 255, 0.38)',
  tabBarActivePill: '#FFFFFF',
  tabBarLabelActive: '#0D0D0D',

  // Legacy keys kept for gradual refactors in components
  primaryGradient: ['#7C6AE8', '#5E4FD4'] as const,
  successGradient: ['#3FA97A', '#2C8F63'] as const,
  /** SDS / streak cards — soft coral → deeper rose (loss / “needs attention”) */
  failureGradient: ['#FFD4CC', '#E89590', '#C75C5C'] as const,
  /** SDS — steady / flat week (neutral, calm) */
  neutralSdsGradient: ['#F3F2F7', '#E8E4FF', '#DDD6F8'] as const,
  shadow: 'rgba(0, 0, 0, 0.06)',
  shadowDark: 'rgba(0, 0, 0, 0.1)',
};

export type ColorKeys = keyof typeof colors;
