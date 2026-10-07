import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';

interface Props {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly padded?: boolean;
  readonly testID?: string;
}

/** Card of the dark theme (the mockup's "glass" card): surface color, hairline border and soft shadow. */
export function GlassCard({ children, style, padded = true, testID }: Props) {
  return (
    <View testID={testID} style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  padded: { padding: spacing.lg },
});
