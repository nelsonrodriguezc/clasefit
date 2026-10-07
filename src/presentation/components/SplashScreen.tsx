import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from './BrandMark';
import { colors, spacing } from '../theme';

export function SplashScreen() {
  return (
    <View testID="splash" style={styles.screen}>
      <BrandMark />
      <Text style={styles.tagline}>Tu energía,{'\n'}nuestras clases</Text>
      <View style={styles.progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  tagline: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '600', textAlign: 'center' },
  progress: { width: 96, height: 3, backgroundColor: colors.primary, borderRadius: 3, marginTop: spacing.xxl },
});
