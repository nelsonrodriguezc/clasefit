import type { Booking } from '@/domain/model/Booking';
import type { Result } from '@/domain/shared/Result';
import { err, ok } from '@/domain/shared/Result';
import { businessDateOf, daysBetween } from '@/domain/time/businessTime';

import type { BookingRepository } from '../ports/BookingRepository';
import type { Clock } from '../ports/Clock';
import type { Logger } from '../ports/Logger';
import type { MemberSession } from '../ports/MemberSession';
import type { TaskQueue } from '../ports/TaskQueue';

export interface PurgeExpiredBookingsUseCase {
  /** Resolves with the number of bookings removed. */
  execute(): Promise<Result<number, 'UNEXPECTED'>>;
}

interface Dependencies {
  readonly bookings: BookingRepository;
  readonly memberSession: MemberSession;
  readonly clock: Clock;
  readonly queue: TaskQueue;
  readonly logger: Logger;
}

/**
 * Data minimization and retention: removes bookings of days before today (Bogota). Today's
 * bookings stay even if their class started, because RN-03 counts them.
 */
export class PurgeExpiredBookings implements PurgeExpiredBookingsUseCase {
  constructor(private readonly deps: Dependencies) {}

  execute(): Promise<Result<number, 'UNEXPECTED'>> {
    return this.deps.queue.run(async () => {
      const { bookings, memberSession, clock, logger } = this.deps;

      let memberBookings: readonly Booking[];
      try {
        const member = await memberSession.current();
        memberBookings = await bookings.findByMember(member.id);
      } catch {
        logger.error('bookings.read_failed');
        return err('UNEXPECTED');
      }

      const today = businessDateOf(clock.now());
      const expired = memberBookings.filter((booking) => daysBetween(booking.sessionDate, today) > 0);
      if (expired.length === 0) return ok(0);

      try {
        await bookings.remove(expired.map((booking) => booking.id));
      } catch {
        logger.error('bookings.write_failed');
        return err('UNEXPECTED');
      }
      return ok(expired.length);
    });
  }
}
