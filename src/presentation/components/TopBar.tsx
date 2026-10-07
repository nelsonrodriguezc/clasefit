import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../theme';
import { BrandMark } from './BrandMark';

/** Header of every tab: the logo on the left (inside the safe area) and an optional action on the right. */
export function TopBar({ right }: { readonly right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <BrandMark />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    minHeight: 56,
  },
});
