import type { Booking } from '@/domain/model/Booking';
import type { Result } from '@/domain/shared/Result';
import { err, ok } from '@/domain/shared/Result';
import { businessDateOf, daysBetween, hasStarted } from '@/domain/time/businessTime';

import type { ListMyBookingsError } from '../errors';
import type { BookingRepository } from '../ports/BookingRepository';
import type { Clock } from '../ports/Clock';
import type { Logger } from '../ports/Logger';
import type { MemberSession } from '../ports/MemberSession';
import type { MyBooking } from '../views';

export interface ListMyBookingsUseCase {
  execute(): Promise<Result<readonly MyBooking[], ListMyBookingsError>>;
}

interface Dependencies {
  readonly bookings: BookingRepository;
  readonly memberSession: MemberSession;
  readonly clock: Clock;
  readonly logger: Logger;
}

const byStart = (a: Booking, b: Booking): number => a.startsAt - b.startsAt || a.className.localeCompare(b.className);

/** HU-03: the member's bookings of classes that have not started, the closest first. */
export class ListMyBookings implements ListMyBookingsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(): Promise<Result<readonly MyBooking[], ListMyBookingsError>> {
    const { bookings, memberSession, clock, logger } = this.deps;

    let memberBookings: readonly Booking[];
    try {
      const member = await memberSession.current();
      memberBookings = await bookings.findByMember(member.id);
    } catch {
      logger.error('bookings.read_failed');
      return err('UNEXPECTED');
    }

    const now = clock.now();
    const today = businessDateOf(now);
    return ok(
      memberBookings
        .filter((booking) => !hasStarted(booking.startsAt, now))
        .sort(byStart)
        .map((booking) => ({ ...booking, daysFromToday: daysBetween(today, booking.sessionDate) })),
    );
  }
}
