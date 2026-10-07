import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '../components/BrandMark';
import { GlassCard } from '../components/GlassCard';
import { TEXTS } from '../messages';
import { colors, radius, spacing } from '../theme';

const rows = [
  ['calendar-outline', TEXTS.myBookingsTitle],
  ['notifications-outline', 'Notificaciones'],
  ['help-circle-outline', 'Ayuda y soporte'],
] as const;

export function ProfileScreen() {
  return (
    <ScrollView testID="profile" style={styles.screen} contentContainerStyle={styles.content}>
      <BrandMark compact />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>LG</Text>
        </View>
        <View>
          <Text style={styles.name}>Laura Gómez</Text>
          <Text style={styles.memberId}>S-0001 · Miembro activo</Text>
        </View>
      </View>
      <GlassCard>
        {rows.map(([icon, label]) => (
          <View key={label} style={styles.row}>
            <Ionicons name={icon} size={20} color={colors.primaryLight} />
            <Text style={styles.rowLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        ))}
      </GlassCard>
      <GlassCard style={styles.motivation}>
        <Text style={styles.motivationTitle}>Tu esfuerzo también es un logro</Text>
        <Text style={styles.motivationText}>Sigue reservando tus próximas clases.</Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryLight, fontSize: 22, fontWeight: '800' },
  name: { color: colors.text, fontSize: 20, fontWeight: '800' },
  memberId: { color: colors.muted, marginTop: spacing.xs },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { flex: 1, color: colors.text, fontSize: 15 },
  motivation: { backgroundColor: colors.surfaceMuted, borderRadius: radius.lg },
  motivationTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  motivationText: { color: colors.muted, marginTop: spacing.sm },
});
