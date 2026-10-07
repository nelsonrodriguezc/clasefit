import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

export function BrandMark({ compact = false }: { readonly compact?: boolean }) {
  return (
    <View style={[styles.container, compact && styles.compact]} accessibilityLabel="ClaseFit">
      <View style={styles.leaf}>
        <Text style={styles.leafText}>F</Text>
      </View>
      <Text style={[styles.name, compact && styles.compactName]}>
        Clase<Text style={styles.nameAccent}>Fit</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  compact: { gap: spacing.xs },
  leaf: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  leafText: { color: colors.onPrimary, fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  name: { color: colors.text, fontSize: 22, fontWeight: '800', fontStyle: 'italic' },
  compactName: { fontSize: 17 },
  nameAccent: { color: colors.primaryLight },
});
