import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { DisciplineIconName } from '../disciplines';
import { colors } from '../theme';

/** Discipline icon on a tinted square: stands in for the mockup photos (assumption UI-2). Decorative. */
export function IconTile({ icon, size = 52 }: { readonly icon: DisciplineIconName; readonly size?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.tile, { width: size, height: size, borderRadius: size * 0.28 }]}
    >
      <MaterialCommunityIcons name={icon} size={size * 0.54} color={colors.primaryLight} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
