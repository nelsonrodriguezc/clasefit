import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

// Exported from assets/brand/clasefit-mark.svg (scripts/export-brand-assets.ps1).
export const BRAND_MARK_IMAGE: number = require('../../../assets/brand/brand-mark.png');

const SIZES = {
  sm: { mark: 28, text: 20 },
  lg: { mark: 56, text: 36 },
} as const;

/** ClaseFit logo: the leaf "F" mark and the "Clase" + "Fit" wordmark. */
export function BrandMark({ size = 'sm' }: { readonly size?: keyof typeof SIZES }) {
  const { mark, text } = SIZES[size];
  return (
    <View style={styles.row} accessible accessibilityLabel="ClaseFit">
      <Image source={BRAND_MARK_IMAGE} style={{ width: mark, height: mark }} resizeMode="contain" />
      <Text style={[styles.wordmark, { fontSize: text }]}>
        Clase<Text style={styles.accent}>Fit</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  wordmark: { color: colors.text, fontWeight: '800', fontStyle: 'italic', letterSpacing: -0.5 },
  accent: { color: colors.primaryLight },
});
