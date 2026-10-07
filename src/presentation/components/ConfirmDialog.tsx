import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  readonly visible: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** Own modal (not Alert.alert) so it behaves the same on every platform and is testable. */
export function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <PrimaryButton label={cancelLabel} variant="secondary" onPress={onCancel} />
            <PrimaryButton label={confirmLabel} variant="danger" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl },
  dialog: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  message: { fontSize: 16, color: colors.muted },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
