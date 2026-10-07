import type { Booking } from '@/domain/model/Booking';
import { createBooking } from '@/domain/model/Booking';
import type { GymClass } from '@/domain/model/GymClass';
import type { Member } from '@/domain/model/Member';
import type { BookingRule } from '@/domain/rules/BookingRule';
import { evaluateRules } from '@/domain/rules/Rule';
import { scheduleWindow } from '@/domain/schedule/schedule';
import type { Result } from '@/domain/shared/Result';
import { err, ok } from '@/domain/shared/Result';
import { businessDateOf } from '@/domain/time/businessTime';

import type { BookClassError } from '../errors';
import type { BookingRepository } from '../ports/BookingRepository';
import type { ClassCatalog } from '../ports/ClassCatalog';
import type { Clock } from '../ports/Clock';
import type { IdGenerator } from '../ports/IdGenerator';
import type { Logger } from '../ports/Logger';
import type { MemberSession } from '../ports/MemberSession';
import type { TaskQueue } from '../ports/TaskQueue';

export interface BookClassUseCase {
  execute(sessionId: string): Promise<Result<Booking, BookClassError>>;
}

interface Dependencies {
  readonly catalog: ClassCatalog;
  readonly bookings: BookingRepository;
  readonly memberSession: MemberSession;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly queue: TaskQueue;
  readonly logger: Logger;
  /** Evaluated in order; the first violation is the message the member sees. */
  readonly rules: readonly BookingRule[];
}

/** HU-02: books a session after re-validating every rule against fresh data. */
export class BookClass implements BookClassUseCase {
  constructor(private readonly deps: Dependencies) {}

  /** Serialized: read → validate → write runs atomically with respect to other bookings/cancellations. */
  execute(sessionId: string): Promise<Result<Booking, BookClassError>> {
    return this.deps.queue.run(() => this.book(sessionId));
  }

  private async book(sessionId: string): Promise<Result<Booking, BookClassError>> {
    const { catalog, bookings, memberSession, clock, ids, logger, rules } = this.deps;

    let classes: readonly GymClass[];
    try {
      classes = (await catalog.load()).classes;
    } catch {
      logger.error('catalog.load_failed');
      return err('UNEXPECTED');
    }

    let member: Member;
    let memberBookings: readonly Booking[];
    try {
      member = await memberSession.current();
      memberBookings = await bookings.findByMember(member.id);
    } catch {
      logger.error('bookings.read_failed');
      return err('UNEXPECTED');
    }

    const now = clock.now();
    const session = scheduleWindow(classes, businessDateOf(now)).find((candidate) => candidate.id === sessionId);
    if (!session) return err('SESSION_NOT_FOUND');

    const verdict = evaluateRules(rules, { session, memberBookings, now });
    if (!verdict.ok) return err(verdict.error);

    const booking = createBooking({ id: ids.next(), memberId: member.id, session, bookedAt: now });
    try {
      await bookings.add(booking);
    } catch {
      logger.error('bookings.write_failed');
      return err('UNEXPECTED');
    }
    return ok(booking);
  }
}
