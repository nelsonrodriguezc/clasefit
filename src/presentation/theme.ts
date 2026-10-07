/** Design tokens. Text/background pairs meet WCAG AA contrast (4.5:1 or more). */
export const colors = {
  background: '#081220',
  surface: '#0B1B2C',
  surfaceRaised: '#10263A',
  surfaceMuted: '#132D43',
  text: '#F8FAFC',
  muted: '#A8B8C8',
  border: '#294057',
  primary: '#22C55E',
  primaryLight: '#86EFAC',
  primaryDark: '#065F46',
  onPrimary: '#04110A',
  danger: '#EF4444',
  dangerSurface: '#30151D',
  success: '#22C55E',
  successSurface: '#073D35',
  warning: '#F59E0B',
  warningSurface: '#3A2A0D',
  badgeSurface: '#0F624D',
  badgeText: '#BBF7D0',
  disabled: '#64748B',
  overlay: 'rgba(1, 8, 18, 0.78)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
} as const;

/** Minimum touch target (Android 48dp / iOS 44pt). */
export const MIN_TOUCH = 48;
