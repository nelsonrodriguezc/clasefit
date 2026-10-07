import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { GlassCard } from '../components/GlassCard';
import { Notice } from '../components/Notice';
import { ErrorState, LoadingState } from '../components/StateViews';
import { TopBar } from '../components/TopBar';
import { useActiveBookingsCount } from '../hooks/useActiveBookingsCount';
import { useMemberProfile } from '../hooks/useMemberProfile';
import { activeBookingsLabel, TEXTS } from '../messages';
import type { TabParamList } from '../navigation/routes';
import { colors, MIN_TOUCH, spacing } from '../theme';

/**
 * The member's summary with real data only. Options of the mockup that belong to features outside
 * the MVP (login, notifications, history, settings) are deliberately not shown.
 */
export function ProfileScreen() {
  const { state, reload } = useMemberProfile();
  const activeBookings = useActiveBookingsCount();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={() => void reload()} />;

  const { member } = state;
  const bookingsSummary = activeBookings === null ? null : activeBookingsLabel(activeBookings);

  return (
    <View testID="profile" style={styles.screen}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.identity}>
          <Avatar name={member.name} size={72} />
          <View style={styles.identityText}>
            <Text accessibilityRole="header" style={styles.name}>
              {member.name}
            </Text>
            <Text style={styles.memberId}>{member.id}</Text>
            <Badge tone="success" label={TEXTS.memberActive} />
          </View>
        </GlassCard>
        <GlassCard padded={false}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={bookingsSummary ? `${TEXTS.myBookingsTitle}, ${bookingsSummary}` : TEXTS.myBookingsTitle}
            onPress={() => navigation.navigate('MyBookings')}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Ionicons name="bookmark-outline" size={22} color={colors.primaryLight} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{TEXTS.myBookingsTitle}</Text>
              {bookingsSummary && <Text style={styles.rowSubtitle}>{bookingsSummary}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </GlassCard>
        <Notice icon="shield-checkmark-outline" text={TEXTS.securityNote} />
        <GlassCard style={styles.motivation}>
          <MaterialCommunityIcons name="trophy-outline" size={36} color={colors.primaryLight} />
          <View style={styles.motivationText}>
            <Text style={styles.motivationTitle}>{TEXTS.motivationTitle}</Text>
            <Text style={styles.rowSubtitle}>{TEXTS.motivationText}</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityText: { flex: 1, gap: spacing.xs },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  memberId: { color: colors.muted, fontSize: 15 },
  row: { minHeight: MIN_TOUCH + spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  pressed: { opacity: 0.8 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowSubtitle: { color: colors.muted, fontSize: 14 },
  motivation: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  motivationText: { flex: 1, gap: spacing.xs },
  motivationTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
});
