import { HOUR_MS } from '../time/businessTime';
import { AvailableSpotsRule } from './AvailableSpotsRule';
import type { BookingRule } from './BookingRule';
import type { CancellationRule } from './CancellationRule';
import { CancellationWindowRule } from './CancellationWindowRule';
import { DailyBookingLimitRule } from './DailyBookingLimitRule';
import { NoDuplicateBookingRule } from './NoDuplicateBookingRule';
import { SessionNotStartedRule } from './SessionNotStartedRule';

/** RN-03 */
export const MAX_BOOKINGS_PER_DAY = 2;
/** RN-04 */
export const MIN_CANCELLATION_NOTICE_MS = 2 * HOUR_MS;

/**
 * Booking rules in message-priority order (assumption S7): a started class first, then
 * RN-02 (already booked), RN-01 (no spots) and RN-03 (daily limit).
 */
export const defaultBookingRules = (): readonly BookingRule[] => [
  new SessionNotStartedRule(),
  new NoDuplicateBookingRule(),
  new AvailableSpotsRule(),
  new DailyBookingLimitRule(MAX_BOOKINGS_PER_DAY),
];

export const defaultCancellationRules = (): readonly CancellationRule[] => [
  new CancellationWindowRule(MIN_CANCELLATION_NOTICE_MS),
];
