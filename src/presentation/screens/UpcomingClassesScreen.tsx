import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import type { UpcomingClass } from '@/application/views';
import { ClassCard } from '../components/ClassCard';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useUpcomingClasses } from '../hooks/useUpcomingClasses';
import { TEXTS } from '../messages';
import { colors, spacing } from '../theme';
import { BrandMark } from '../components/BrandMark';
import { DateChip } from '../components/DateChip';
import { ClassDetailScreen } from './ClassDetailScreen';

/** HU-01 / HU-02 */
export function UpcomingClassesScreen() {
  const { state, pendingSessionId, feedback, dismissFeedback, book, refresh } = useUpcomingClasses();
  const [detail, setDetail] = useState<UpcomingClass | null>(null);

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={() => void refresh()} />;

  return (
    <View testID="upcoming-classes" style={styles.screen}>
      <View style={styles.header}>
        <BrandMark compact />
        <Text style={styles.greeting}>Hola, <Text style={styles.greetingAccent}>Laura</Text> 👋</Text>
        <Text style={styles.subtitle}>Encuentra tu próxima clase</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <DateChip label="Hoy" selected />
          <DateChip label="Mañana" />
          <DateChip label="Pasado mañana" />
        </ScrollView>
      </View>
      {feedback && <FeedbackBanner feedback={feedback} onDismiss={dismissFeedback} />}
      {/* At most three days of classes: a plain ScrollView is enough (no virtualization needed). */}
      <ScrollView contentContainerStyle={styles.list}>
        {state.items.length === 0 && <EmptyState message={TEXTS.noUpcomingClasses} />}
        {state.items.map((item) => (
          <ClassCard
            key={item.sessionId}
            item={item}
            busy={pendingSessionId === item.sessionId}
            disabled={pendingSessionId !== null}
            onBook={(sessionId) => void book(sessionId)}
            onOpen={setDetail}
          />
        ))}
      </ScrollView>
      <ClassDetailScreen
        item={detail}
        visible={detail !== null}
        onClose={() => setDetail(null)}
        onBook={() => {
          if (detail) void book(detail.sessionId);
        }}
        busy={detail !== null && pendingSessionId === detail.sessionId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  greeting: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: spacing.md },
  greetingAccent: { color: colors.primaryLight },
  subtitle: { color: colors.muted, fontSize: 15 },
  chips: { gap: spacing.sm, paddingVertical: spacing.sm },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
});
