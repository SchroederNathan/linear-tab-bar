export const COLORS = {
  background: '#0A0A0A',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceHover: 'rgba(255, 255, 255, 0.12)',
  textPrimary: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.12)',
  glassGradientTop: 'rgba(255, 255, 255, 0.11)',
  glassGradientBottom: 'rgba(255, 255, 255, 0.05)',
  accentBlue: '#3B82F6',
  iconDefault: 'rgba(255, 255, 255, 0.9)',
  iconActive: 'rgba(255, 255, 255, 0.9)',
} as const;

export const SPRING = {
  damping: 24,
  stiffness: 170,
  mass: 1,
} as const;

export const SPRING_BOUNCY = {
  damping: 22,
  stiffness: 250,
  mass: 0.6,
} as const;
