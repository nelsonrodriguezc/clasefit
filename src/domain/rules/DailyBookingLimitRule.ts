import type { Result } from '../shared/Result';
import { err } from '../shared/Result';
import type { BookingAttempt, BookingRule, BookingViolation } from './BookingRule';
import { PASSES } from './Rule';

/**
 * RN-03: at most `maxPerDay` bookings per class day (Bogota calendar date). Bookings of classes
 * of that day that already started still count: they are bookings of that day.
 */
export class DailyBookingLimitRule implements BookingRule {
  constructor(private readonly maxPerDay: number) {}

  check({ session, memberBookings }: BookingAttempt): Result<void, BookingViolation> {
    const sameDay = memberBookings.filter((booking) => booking.sessionDate === session.date).length;
    return sameDay >= this.maxPerDay ? err('DAILY_LIMIT_REACHED') : PASSES;
  }
}
