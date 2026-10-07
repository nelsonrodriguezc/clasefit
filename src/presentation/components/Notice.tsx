import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import type { IoniconName } from './InfoRow';

/** Informative note with a green outline (e.g. the cancellation rule), as in the mockup. */
export function Notice({ text, icon = 'information-circle-outline' }: { readonly text: string; readonly icon?: IoniconName }) {
  return (
    <View style={styles.notice}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.successSurface,
  },
  text: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
});
