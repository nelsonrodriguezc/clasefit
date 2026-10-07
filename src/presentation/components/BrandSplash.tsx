import { Image, StyleSheet, Text, View } from 'react-native';

import { TEXTS } from '../messages';
import { colors, spacing } from '../theme';
import { BRAND_MARK_IMAGE } from './BrandMark';

/**
 * Launch screen shown over the app while "Próximas clases" loads. The mark sits at the exact center
 * and size of the native splash (app.json: imageWidth 200, mark at 50% of splash-icon.png), so the
 * hand-off from the native splash is seamless; the name and tagline appear below it.
 */
const MARK_SIZE = 106; // brand-mark.png draws the mark at 94% of its height: 100 dp, like the native splash

export function BrandSplash() {
  return (
    <View testID="brand-splash" style={styles.screen}>
      <Image source={BRAND_MARK_IMAGE} style={styles.mark} resizeMode="contain" />
      <View style={styles.below}>
        <Text style={styles.wordmark}>
          Clase<Text style={styles.accent}>Fit</Text>
        </Text>
        {/* Two lines as in the mockup: "Tu energía," / "nuestras clases". */}
        <Text style={styles.tagline}>{TEXTS.tagline.replace(', ', ',\n')}</Text>
        <View style={styles.progress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: MARK_SIZE, height: MARK_SIZE },
  below: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: MARK_SIZE / 2 + spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  wordmark: { color: colors.text, fontSize: 40, fontWeight: '800', fontStyle: 'italic', letterSpacing: -1 },
  accent: { color: colors.primaryLight },
  tagline: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '500', textAlign: 'center' },
  progress: { width: 96, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: spacing.xxl },
});
