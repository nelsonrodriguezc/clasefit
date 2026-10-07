import { ScrollView, StyleSheet, View } from 'react-native';

import { ClassCard } from '../components/ClassCard';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useUpcomingClasses } from '../hooks/useUpcomingClasses';
import { TEXTS } from '../messages';
import { colors, spacing } from '../theme';

/** HU-01 / HU-02 */
export function UpcomingClassesScreen() {
  const { state, pendingSessionId, feedback, dismissFeedback, book, refresh } = useUpcomingClasses();

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={() => void refresh()} />;

  return (
    <View testID="upcoming-classes" style={styles.screen}>
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
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md },
});
