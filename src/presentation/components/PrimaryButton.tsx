import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, MIN_TOUCH, radius, spacing } from '../theme';
import type { IoniconName } from './InfoRow';

type Variant = 'primary' | 'danger' | 'secondary' | 'outlineDanger';

interface Props {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: Variant;
  readonly icon?: IoniconName;
  /** Pill-shaped and narrow, for the action inside a card (same 48 dp touch height). */
  readonly compact?: boolean;
  readonly disabled?: boolean;
  readonly busy?: boolean;
  readonly accessibilityLabel?: string;
}

/** Label colors: dark text on green (white on #22C55E would be 2.3:1, assumption UI-5). */
const LABEL_COLORS: Readonly<Record<Variant, string>> = {
  primary: colors.onPrimary,
  danger: colors.onDanger,
  secondary: colors.text,
  outlineDanger: colors.dangerText,
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  compact = false,
  disabled = false,
  busy = false,
  accessibilityLabel,
}: Props) {
  const inactive = disabled || busy;
  const color = LABEL_COLORS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.base, compact && styles.compact, styles[variant], inactive && styles.inactive, pressed && styles.pressed]}
    >
      {busy ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={18} color={color} />}
          <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
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
  compact: { borderRadius: radius.pill, paddingHorizontal: spacing.xl, alignSelf: 'flex-end' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.dangerStrong },
  secondary: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
  outlineDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
  inactive: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontSize: 16, fontWeight: '700' },
});
