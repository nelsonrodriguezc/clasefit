import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { TEXTS } from '../messages';
import { colors, spacing } from '../theme';
import { PrimaryButton } from './PrimaryButton';

export function LoadingState() {
  return (
    <View testID="loading" style={styles.center} accessibilityLabel={TEXTS.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{TEXTS.loading}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="alert" style={styles.text}>
        {message}
      </Text>
      <PrimaryButton label={TEXTS.retry} onPress={onRetry} />
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  text: { fontSize: 16, color: colors.muted, textAlign: 'center' },
});
