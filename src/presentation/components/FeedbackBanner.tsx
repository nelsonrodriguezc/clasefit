import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Feedback } from '../feedback';
import { TEXTS } from '../messages';
import { colors, MIN_TOUCH, radius, spacing } from '../theme';

interface Props {
  readonly feedback: Feedback;
  readonly onDismiss: () => void;
}

/** Result of the last action. Announced to screen readers when it appears. */
export function FeedbackBanner({ feedback, onDismiss }: Props) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(feedback.message);
  }, [feedback]);

  const isError = feedback.kind === 'error';
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, isError ? styles.error : styles.success]}
    >
      <Text style={[styles.message, { color: isError ? colors.danger : colors.success }]}>{feedback.message}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={TEXTS.dismiss} onPress={onDismiss} style={styles.close}>
        <Text style={styles.closeLabel}>{TEXTS.dismiss}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingLeft: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  success: { backgroundColor: colors.successSurface, borderColor: colors.success },
  error: { backgroundColor: colors.dangerSurface, borderColor: colors.danger },
  message: { flex: 1, fontSize: 15, fontWeight: '600', paddingVertical: spacing.md },
  close: { minHeight: MIN_TOUCH, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  closeLabel: { color: colors.text, fontWeight: '600' },
});
