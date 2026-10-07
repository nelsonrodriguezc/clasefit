import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, MIN_TOUCH, radius, spacing } from '../theme';

interface Props {
  readonly title: string;
  readonly subtitle?: string | null;
  readonly selected: boolean;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
}

/** One day of the day selector ("Hoy / Mar 6 oct", "Mié 7 oct"). */
export function DateChip({ title, subtitle, selected, accessibilityLabel, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.title, selected && styles.onSelected]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, selected && styles.onSelected]}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MIN_TOUCH + spacing.sm,
    minWidth: 104,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  onSelected: { color: colors.onPrimary },
});
