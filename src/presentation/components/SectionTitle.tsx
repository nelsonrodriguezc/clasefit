import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';
import type { IoniconName } from './InfoRow';

/** Section heading with an icon ("Próximas clases"). */
export function SectionTitle({ icon, title }: { readonly icon: IoniconName; readonly title: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
});
