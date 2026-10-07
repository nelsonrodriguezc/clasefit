import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** One line of class information with its icon (date, instructor, spots). */
export function InfoRow({ icon, children }: { readonly icon: IoniconName; readonly children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

/** "8 de 20 cupos" with the available number highlighted, as in the mockup. */
export function SpotsRow({ available, capacity }: { readonly available: number; readonly capacity: number }) {
  return (
    <InfoRow icon="people-outline">
      <Text style={styles.highlight}>{available}</Text>
      {` de ${capacity} cupos`}
    </InfoRow>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { flexShrink: 1, color: colors.muted, fontSize: 14 },
  highlight: { color: colors.primary, fontWeight: '800' },
});
