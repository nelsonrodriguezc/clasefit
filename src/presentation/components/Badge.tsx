import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

export type BadgeTone = 'success' | 'danger' | 'neutral';

/** Status label of the mockup: "Reservada" (green), "Llena" (red), neutral (gray). */
export function Badge({ label, tone }: { readonly label: string; readonly tone: BadgeTone }) {
  return (
    <View style={[styles.badge, surfaces[tone]]}>
      <Text style={[styles.label, labels[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
  },
  label: { fontSize: 12, fontWeight: '700' },
});

const surfaces = StyleSheet.create({
  success: { backgroundColor: colors.badgeSurface, borderColor: colors.primaryBorder },
  danger: { backgroundColor: colors.dangerSurface, borderColor: colors.danger },
  neutral: { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
});

const labels = StyleSheet.create({
  success: { color: colors.badgeText },
  danger: { color: colors.dangerText },
  neutral: { color: colors.muted },
});
