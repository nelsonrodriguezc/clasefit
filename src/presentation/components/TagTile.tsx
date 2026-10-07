import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { DisciplineIconName } from '../disciplines';
import { colors, radius, spacing } from '../theme';

/** Benefit of a discipline in the class detail ("Cardio", "Fuerza"...). */
export function TagTile({ label, icon }: { readonly label: string; readonly icon: DisciplineIconName }) {
  return (
    <View style={styles.tag}>
      <View style={styles.icon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <MaterialCommunityIcons name={icon} size={26} color={colors.primaryLight} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { flex: 1, alignItems: 'center', gap: spacing.sm },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.text, fontSize: 13, fontWeight: '600' },
});
