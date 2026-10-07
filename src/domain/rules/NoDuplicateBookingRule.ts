import { isBookedBy } from '../availability/availability';
import type { Result } from '../shared/Result';
import { err } from '../shared/Result';
import type { BookingAttempt, BookingRule, BookingViolation } from './BookingRule';
import { PASSES } from './Rule';

/** RN-02: the same session (same class on the same date) cannot be booked twice. */
export class NoDuplicateBookingRule implements BookingRule {
  check({ session, memberBookings }: BookingAttempt): Result<void, BookingViolation> {
    return isBookedBy(session, memberBookings) ? err('ALREADY_BOOKED') : PASSES;
  }
}
