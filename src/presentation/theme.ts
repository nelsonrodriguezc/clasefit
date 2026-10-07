/**
 * Design tokens. The first group is the mockup palette; the derived colors exist so that every
 * text/background pair reaches WCAG AA contrast (4.5:1 or more). The app-shell acceptance suite
 * computes those ratios, so a token change that breaks contrast fails the build.
 */
export const colors = {
  // Mockup palette
  background: '#0B1220',
  surface: '#1A2332',
  text: '#F8FAFC',
  muted: '#94A3B8',
  primary: '#22C55E',
  primaryLight: '#86EFAC',
  primaryDark: '#065F46',
  danger: '#EF4444',
  // Derived
  surfaceRaised: '#243044',
  border: '#2B3A4F',
  tabBar: '#0F1828',
  onPrimary: '#052E16',
  dangerText: '#F87171',
  dangerStrong: '#B91C1C',
  onDanger: '#FFFFFF',
  successSurface: '#0D2B22',
  dangerSurface: '#2A1520',
  warning: '#F59E0B',
  warningText: '#FBBF24',
  warningSurface: '#2A2414',
  badgeSurface: '#065F46',
  badgeText: '#86EFAC',
  // Translucent accents (icons and borders only, never behind text)
  primaryTint: 'rgba(34, 197, 94, 0.14)',
  primaryBorder: 'rgba(34, 197, 94, 0.45)',
  overlay: 'rgba(2, 6, 15, 0.8)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

/** Minimum touch target (Android 48dp / iOS 44pt). */
export const MIN_TOUCH = 48;
