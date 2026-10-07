/** Design tokens. Text/background pairs meet WCAG AA contrast (4.5:1 or more). */
export const colors = {
  background: '#F2F4F7',
  surface: '#FFFFFF',
  text: '#101828',
  muted: '#475467',
  border: '#D0D5DD',
  primary: '#0B6E4F',
  onPrimary: '#FFFFFF',
  danger: '#B42318',
  dangerSurface: '#FEF3F2',
  success: '#067647',
  successSurface: '#ECFDF3',
  badgeSurface: '#E0F2FE',
  badgeText: '#075985',
  disabled: '#98A2B3',
  overlay: 'rgba(16, 24, 40, 0.5)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

export const radius = { md: 12, lg: 16, pill: 999 } as const;

/** Minimum touch target (Android 48dp / iOS 44pt). */
export const MIN_TOUCH = 48;
