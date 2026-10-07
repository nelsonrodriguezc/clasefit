import { availableSpots } from '../availability/availability';
import type { Result } from '../shared/Result';
import { err } from '../shared/Result';
import type { BookingAttempt, BookingRule, BookingViolation } from './BookingRule';
import { PASSES } from './Rule';

/** RN-01: a class without available spots cannot be booked. */
export class AvailableSpotsRule implements BookingRule {
  check({ session, memberBookings }: BookingAttempt): Result<void, BookingViolation> {
    return availableSpots(session, memberBookings) > 0 ? PASSES : err('CLASS_FULL');
  }
}
