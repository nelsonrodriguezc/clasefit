import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { ClassCard } from '../components/ClassCard';
import { DateChip } from '../components/DateChip';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { SectionTitle } from '../components/SectionTitle';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { TopBar } from '../components/TopBar';
import { dayAtOffset, groupByDay } from '../daySections';
import { dayChipText, dayLabel, firstNameOf } from '../formatters';
import { useMemberProfile } from '../hooks/useMemberProfile';
import { useUpcomingClasses } from '../hooks/useUpcomingClasses';
import { TEXTS } from '../messages';
import type { TabParamList } from '../navigation/routes';
import { useReportContentReady } from '../startup/contentReady';
import { colors, radius, spacing } from '../theme';
import { ClassDetailModal } from './ClassDetailModal';

/** While the list scrolls to the day chosen in the selector, scrolling does not change the selection. */
const SELECTOR_SCROLL_MS = 600;

/** HU-01 / HU-02 */
export function UpcomingClassesScreen() {
  const { state, pendingSessionId, feedback, dismissFeedback, book, refresh, cancellation } = useUpcomingClasses();
  const { state: memberState } = useMemberProfile();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef(new Map<number, number>());
  const selectorHeight = useRef(0);
  const ignoreScrollUntil = useRef(0);

  useReportContentReady(state.status !== 'loading');

  const sections = useMemo(() => (state.status === 'ready' ? groupByDay(state.items) : []), [state]);

  const selectDay = useCallback((day: number) => {
    setSelectedDay(day);
    const offset = sectionOffsets.current.get(day);
    if (offset === undefined) return;
    ignoreScrollUntil.current = Date.now() + SELECTOR_SCROLL_MS;
    scrollRef.current?.scrollTo({ y: Math.max(0, offset - selectorHeight.current), animated: true });
  }, []);

  // The selector follows the scroll: the selected day is the one whose section is at the top.
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Date.now() < ignoreScrollUntil.current) return;
    const visibleTop = event.nativeEvent.contentOffset.y + selectorHeight.current + 1;
    setSelectedDay(dayAtOffset(sectionOffsets.current, visibleTop, null));
  }, []);

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={() => void refresh()} />;

  const member = memberState.status === 'ready' ? memberState.member : null;
  const activeDay = sections.some((section) => section.daysFromToday === selectedDay)
    ? selectedDay
    : (sections[0]?.daysFromToday ?? null);
  const detailItem = detailId === null ? null : (state.items.find((item) => item.sessionId === detailId) ?? null);

  return (
    <View testID="upcoming-classes" style={styles.screen}>
      <TopBar
        right={
          member && <Avatar name={member.name} accessibilityLabel={TEXTS.openProfile} onPress={() => navigation.navigate('Profile')} />
        }
      />
      {feedback && !detailItem && <FeedbackBanner feedback={feedback} onDismiss={dismissFeedback} />}
      {/* At most three days of classes: a plain ScrollView is enough (no virtualization needed). */}
      <ScrollView
        testID="upcoming-list"
        ref={scrollRef}
        stickyHeaderIndices={[1]}
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={styles.content}
      >
        <View style={styles.greeting}>
          <Text style={styles.hello}>
            {TEXTS.greeting}
            {member && (
              <>
                {', '}
                <Text style={styles.firstName}>{firstNameOf(member.name)}</Text>
              </>
            )}
            {' 👋'}
          </Text>
          {member && (
            <View style={styles.memberChip}>
              <Text style={styles.memberId}>{member.id}</Text>
            </View>
          )}
        </View>
        <View
          testID="day-selector"
          style={styles.selector}
          onLayout={(event) => {
            selectorHeight.current = event.nativeEvent.layout.height;
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {sections.map((section) => {
              const { title, subtitle } = dayChipText(section.daysFromToday, section.date);
              return (
                <DateChip
                  key={section.daysFromToday}
                  title={title}
                  subtitle={subtitle}
                  selected={section.daysFromToday === activeDay}
                  accessibilityLabel={dayLabel(section.daysFromToday, section.date)}
                  onPress={() => selectDay(section.daysFromToday)}
                />
              );
            })}
          </ScrollView>
        </View>
        <SectionTitle icon="calendar-outline" title={TEXTS.upcomingTitle} />
        {sections.length === 0 && <EmptyState message={TEXTS.noUpcomingClasses} />}
        {sections.map((section) => (
          <View
            key={section.daysFromToday}
            testID={`day-section-${section.daysFromToday}`}
            style={styles.section}
            onLayout={(event) => sectionOffsets.current.set(section.daysFromToday, event.nativeEvent.layout.y)}
          >
            <Text style={styles.dayHeader}>{dayLabel(section.daysFromToday, section.date)}</Text>
            {section.items.map((item) => (
              <ClassCard
                key={item.sessionId}
                item={item}
                busy={pendingSessionId === item.sessionId}
                disabled={pendingSessionId !== null}
                onBook={(sessionId) => void book(sessionId)}
                onOpen={setDetailId}
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <ClassDetailModal
        item={detailItem}
        feedback={feedback}
        onDismissFeedback={dismissFeedback}
        bookingBusy={detailItem !== null && pendingSessionId === detailItem.sessionId}
        bookingDisabled={pendingSessionId !== null}
        onBook={(sessionId) => void book(sessionId)}
        cancellation={cancellation}
        onClose={() => setDetailId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  greeting: { gap: spacing.sm, paddingTop: spacing.xs },
  hello: { color: colors.text, fontSize: 28, fontWeight: '800' },
  firstName: { color: colors.primaryLight },
  memberChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.badgeSurface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  memberId: { color: colors.badgeText, fontWeight: '700', fontSize: 13 },
  selector: { backgroundColor: colors.background, paddingVertical: spacing.sm },
  chips: { gap: spacing.sm },
  section: { gap: spacing.md },
  dayHeader: { color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
