import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { UpcomingClass } from '@/application/views';

import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { IconTile } from '../components/IconTile';
import { InfoRow, SpotsRow } from '../components/InfoRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { TagTile } from '../components/TagTile';
import { disciplineOf } from '../disciplines';
import type { Feedback } from '../feedback';
import { dayLabel, timeLabel } from '../formatters';
import type { Cancellation } from '../hooks/useCancellation';
import { A11Y, TEXTS } from '../messages';
import { colors, MIN_TOUCH, radius, spacing } from '../theme';

interface Props {
  /** The class as it is now in "Próximas clases" (null closes the detail). */
  readonly item: UpcomingClass | null;
  readonly feedback: Feedback | null;
  readonly onDismissFeedback: () => void;
  readonly bookingBusy: boolean;
  readonly bookingDisabled: boolean;
  readonly onBook: (sessionId: string) => void;
  readonly cancellation: Cancellation;
  readonly onClose: () => void;
}

/**
 * Class detail (full-screen modal over "Próximas clases"). It shows the live class, so booking or
 * cancelling here updates it in place; the result message appears inside the detail.
 */
export function ClassDetailModal({ item, onClose, ...props }: Props) {
  return (
    <Modal visible={item !== null} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* A modal is its own window: it needs its own provider to measure the status bar it draws under. */}
      <SafeAreaProvider>{item && <ClassDetail item={item} onClose={onClose} {...props} />}</SafeAreaProvider>
    </Modal>
  );
}

function ClassDetail({
  item,
  feedback,
  onDismissFeedback,
  bookingBusy,
  bookingDisabled,
  onBook,
  cancellation,
  onClose,
}: Props & { readonly item: UpcomingClass }) {
  const insets = useSafeAreaInsets();
  const when = `${dayLabel(item.daysFromToday, item.date)} · ${timeLabel(item.startsAt)}`;
  const discipline = disciplineOf(item.name);
  const canBook = !item.isFull && !item.isBookedByMember;
  const bookingId = item.bookingId;

  return (
    <View testID="class-detail" style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable accessibilityRole="button" accessibilityLabel={TEXTS.back} onPress={onClose} style={styles.back} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <IconTile icon={discipline.icon} size={112} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text accessibilityRole="header" style={styles.name}>
              {item.name}
            </Text>
            {item.isBookedByMember && <Badge tone="success" label={TEXTS.booked} />}
            {item.isFull && <Badge tone="danger" label={TEXTS.full} />}
          </View>
          <InfoRow icon="calendar-outline">{`${when} · ${item.durationMin} min`}</InfoRow>
          <InfoRow icon="person-outline">{`Instructor: ${item.instructor}`}</InfoRow>
          <SpotsRow available={item.availableSpots} capacity={item.capacity} />
          <View style={styles.divider} />
          <Text accessibilityRole="header" style={styles.section}>
            {TEXTS.description}
          </Text>
          <Text style={styles.description}>{discipline.description}</Text>
          {discipline.tags.length > 0 && (
            <View style={styles.tags}>
              {discipline.tags.map((tag) => (
                <TagTile key={tag.label} label={tag.label} icon={tag.icon} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      {feedback && <FeedbackBanner feedback={feedback} onDismiss={onDismissFeedback} />}
      {(canBook || bookingId !== null) && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          {canBook && (
            <PrimaryButton
              label={TEXTS.book}
              accessibilityLabel={A11Y.book(item.name, when)}
              busy={bookingBusy}
              disabled={bookingDisabled || cancellation.busy}
              onPress={() => onBook(item.sessionId)}
            />
          )}
          {bookingId !== null && (
            <PrimaryButton
              label={TEXTS.cancelBooking}
              variant="outlineDanger"
              icon="close-circle-outline"
              accessibilityLabel={A11Y.cancel(item.name, when)}
              busy={cancellation.busy}
              disabled={bookingDisabled}
              onPress={() => void cancellation.requestCancel({ bookingId, summary: `${item.name} · ${when}` })}
            />
          )}
        </View>
      )}
      {/* Inside the detail modal: iOS cannot present a second modal next to an open one. */}
      <ConfirmDialog
        visible={cancellation.candidate !== null}
        title={TEXTS.confirmCancelTitle}
        message={cancellation.candidate?.summary ?? ''}
        confirmLabel={TEXTS.confirmCancelAccept}
        cancelLabel={TEXTS.confirmCancelDismiss}
        onConfirm={() => void cancellation.confirmCancel()}
        onCancel={cancellation.keepBooking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.lg },
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    backgroundColor: colors.successSurface,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  back: {
    alignSelf: 'flex-start',
    marginLeft: spacing.sm,
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  name: { color: colors.text, fontSize: 30, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  section: { color: colors.text, fontSize: 18, fontWeight: '800' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  tags: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
});
