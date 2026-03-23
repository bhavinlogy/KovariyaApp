export const colors = {
  // Brand Colors
  primary: '#2563EB',
  growth: '#10B981',
  accent: '#F59E0B',
  
  // Neutral Colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#2563EB',
  
  // Gradients
  primaryGradient: ['#2563EB', '#1D4ED8'],
  successGradient: ['#10B981', '#059669'],
  
  // Opacity
  primaryLight: 'rgba(37, 99, 235, 0.1)',
  growthLight: 'rgba(16, 185, 129, 0.1)',
  accentLight: 'rgba(245, 158, 11, 0.1)',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
};

export type ColorKeys = keyof typeof colors;
