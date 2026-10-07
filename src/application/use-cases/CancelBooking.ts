import type { Booking } from '@/domain/model/Booking';
import type { CancellationRule } from '@/domain/rules/CancellationRule';
import { evaluateRules } from '@/domain/rules/Rule';
import type { Result } from '@/domain/shared/Result';
import { err, ok } from '@/domain/shared/Result';

import type { CancelBookingError } from '../errors';
import type { BookingRepository } from '../ports/BookingRepository';
import type { Clock } from '../ports/Clock';
import type { Logger } from '../ports/Logger';
import type { MemberSession } from '../ports/MemberSession';
import type { TaskQueue } from '../ports/TaskQueue';

export interface CancelBookingUseCase {
  /** Pre-check before asking for confirmation; it never changes anything. */
  check(bookingId: string): Promise<Result<void, CancelBookingError>>;
  /** Re-validates (time may have passed while confirming) and removes the booking. */
  execute(bookingId: string): Promise<Result<void, CancelBookingError>>;
}

interface Dependencies {
  readonly bookings: BookingRepository;
  readonly memberSession: MemberSession;
  readonly clock: Clock;
  readonly queue: TaskQueue;
  readonly logger: Logger;
  readonly rules: readonly CancellationRule[];
}

/** HU-03 + RN-04: cancels one of the member's own bookings. */
export class CancelBooking implements CancelBookingUseCase {
  constructor(private readonly deps: Dependencies) {}

  async check(bookingId: string): Promise<Result<void, CancelBookingError>> {
    const verdict = await this.findCancellable(bookingId);
    return verdict.ok ? ok(undefined) : verdict;
  }

  execute(bookingId: string): Promise<Result<void, CancelBookingError>> {
    return this.deps.queue.run(async () => {
      const verdict = await this.findCancellable(bookingId);
      if (!verdict.ok) return verdict;
      try {
        await this.deps.bookings.remove([verdict.value.id]);
      } catch {
        this.deps.logger.error('bookings.write_failed');
        return err('UNEXPECTED');
      }
      return ok(undefined);
    });
  }

  /** Looks the booking up only among the member's own bookings (another member's id reads as not found). */
  private async findCancellable(bookingId: string): Promise<Result<Booking, CancelBookingError>> {
    const { bookings, memberSession, clock, logger, rules } = this.deps;

    let memberBookings: readonly Booking[];
    try {
      const member = await memberSession.current();
      memberBookings = await bookings.findByMember(member.id);
    } catch {
      logger.error('bookings.read_failed');
      return err('UNEXPECTED');
    }

    const booking = memberBookings.find((candidate) => candidate.id === bookingId);
    if (!booking) return err('BOOKING_NOT_FOUND');

    const verdict = evaluateRules(rules, { booking, now: clock.now() });
    return verdict.ok ? ok(booking) : err(verdict.error);
  }
}
