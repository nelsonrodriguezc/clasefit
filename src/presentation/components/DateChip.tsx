import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, MIN_TOUCH, radius, spacing } from '../theme';

export function DateChip({
  label,
  selected = false,
  onPress,
}: {
  readonly label: string;
  readonly selected?: boolean;
  readonly onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  selectedLabel: { color: colors.onPrimary },
});
