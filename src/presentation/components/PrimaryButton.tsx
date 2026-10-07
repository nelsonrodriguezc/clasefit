import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, MIN_TOUCH, radius, spacing } from '../theme';

interface Props {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: 'primary' | 'danger' | 'secondary';
  readonly disabled?: boolean;
  readonly busy?: boolean;
  readonly accessibilityLabel?: string;
}

export function PrimaryButton({ label, onPress, variant = 'primary', disabled = false, busy = false, accessibilityLabel }: Props) {
  const inactive = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], inactive && styles.inactive, pressed && styles.pressed]}
    >
      {busy ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.text : colors.onPrimary} />
      ) : (
        <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  inactive: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  secondaryLabel: { color: colors.text },
});
