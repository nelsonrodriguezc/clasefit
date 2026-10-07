import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { UpcomingClass } from '@/application/views';

import { disciplineOf } from '../disciplines';
import { dayLabel, timeLabel } from '../formatters';
import { A11Y, TEXTS } from '../messages';
import { colors, spacing } from '../theme';
import { Badge } from './Badge';
import { GlassCard } from './GlassCard';
import { IconTile } from './IconTile';
import { InfoRow, SpotsRow } from './InfoRow';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  readonly item: UpcomingClass;
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly onBook: (sessionId: string) => void;
  readonly onOpen: (sessionId: string) => void;
}

/** One upcoming class. Rules are not evaluated here: the card only renders the state it receives. */
export function ClassCard({ item, busy, disabled, onBook, onOpen }: Props) {
  const when = `${dayLabel(item.daysFromToday, item.date)} · ${timeLabel(item.startsAt)}`;
  const canBook = !item.isFull && !item.isBookedByMember;

  return (
    <GlassCard testID={`class-${item.sessionId}`} padded={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={A11Y.openDetail(item.name, when)}
        onPress={() => onOpen(item.sessionId)}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <IconTile icon={disciplineOf(item.name).icon} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isBookedByMember && <Badge tone="success" label={TEXTS.booked} />}
            {item.isFull && <Badge tone="danger" label={TEXTS.full} />}
          </View>
          <InfoRow icon="calendar-outline">{`${when} · ${item.durationMin} min`}</InfoRow>
          <InfoRow icon="person-outline">{`Instructor: ${item.instructor}`}</InfoRow>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
      {!item.isFull && (
        <View style={styles.footer}>
          <SpotsRow available={item.availableSpots} capacity={item.capacity} />
          {canBook && (
            <PrimaryButton
              compact
              label={TEXTS.book}
              accessibilityLabel={A11Y.book(item.name, when)}
              busy={busy}
              disabled={disabled}
              onPress={() => onBook(item.sessionId)}
            />
          )}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  body: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  pressed: { opacity: 0.8 },
  info: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, flexShrink: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    minHeight: 48,
  },
});
