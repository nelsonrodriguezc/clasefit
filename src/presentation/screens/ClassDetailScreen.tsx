import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { UpcomingClass } from '@/application/views';

import { dayLabel, spotsLabel, timeLabel } from '../formatters';
import { TEXTS } from '../messages';
import { colors, radius, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export function ClassDetailScreen({
  item,
  visible,
  onClose,
  onBook,
  busy,
}: {
  readonly item: UpcomingClass | null;
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onBook: () => void;
  readonly busy: boolean;
}) {
  if (!item) return null;
  const when = `${dayLabel(item.daysFromToday, item.date)} · ${timeLabel(item.startsAt)} · ${item.durationMin} min`;
  const availability = item.isFull ? TEXTS.full : spotsLabel(item.availableSpots, item.capacity);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View testID="class-detail" style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={onClose} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Detalle de clase</Text>
          <View style={styles.back} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          {item.isBookedByMember && <Text style={styles.badge}>{TEXTS.booked}</Text>}
          <Text style={styles.detail}>{when}</Text>
          <Text style={styles.detail}>Instructor: {item.instructor}</Text>
          <Text style={styles.detail}>{availability}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>Clase de alta intensidad enfocada en mejorar tu resistencia cardiovascular, fuerza y quemar calorías.</Text>
          {!item.isFull && !item.isBookedByMember && <PrimaryButton label={TEXTS.book} busy={busy} onPress={onBook} />}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: { minHeight: 64, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  content: { padding: spacing.lg, gap: spacing.md },
  name: { color: colors.text, fontSize: 30, fontWeight: '900' },
  badge: { alignSelf: 'flex-start', color: colors.badgeText, backgroundColor: colors.badgeSurface, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, fontWeight: '700' },
  detail: { color: colors.muted, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23, marginBottom: spacing.lg },
});
