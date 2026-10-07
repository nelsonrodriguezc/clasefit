import { availableSpots, bookingOf } from '@/domain/availability/availability';
import type { Booking } from '@/domain/model/Booking';
import type { ClassSession } from '@/domain/model/ClassSession';
import { scheduleWindow } from '@/domain/schedule/schedule';
import type { Result } from '@/domain/shared/Result';
import { err, ok } from '@/domain/shared/Result';
import type { BusinessDate } from '@/domain/time/businessTime';
import { businessDateOf, daysBetween, hasStarted } from '@/domain/time/businessTime';

import type { ListUpcomingClassesError } from '../errors';
import type { BookingRepository } from '../ports/BookingRepository';
import type { Catalog, ClassCatalog } from '../ports/ClassCatalog';
import type { Clock } from '../ports/Clock';
import type { Logger } from '../ports/Logger';
import type { MemberSession } from '../ports/MemberSession';
import type { UpcomingClass } from '../views';

export interface ListUpcomingClassesUseCase {
  execute(): Promise<Result<readonly UpcomingClass[], ListUpcomingClassesError>>;
}

interface Dependencies {
  readonly catalog: ClassCatalog;
  readonly bookings: BookingRepository;
  readonly memberSession: MemberSession;
  readonly clock: Clock;
  readonly logger: Logger;
}

const byStart = (a: ClassSession, b: ClassSession): number =>
  a.startsAt - b.startsAt || a.name.localeCompare(b.name) || a.classId.localeCompare(b.classId);

const toView = (session: ClassSession, memberBookings: readonly Booking[], today: BusinessDate): UpcomingClass => {
  const spots = availableSpots(session, memberBookings);
  const booking = bookingOf(session, memberBookings);
  return {
    sessionId: session.id,
    classId: session.classId,
    name: session.name,
    instructor: session.instructor,
    date: session.date,
    daysFromToday: daysBetween(today, session.date),
    startsAt: session.startsAt,
    durationMin: session.durationMin,
    capacity: session.capacity,
    availableSpots: spots,
    isFull: spots === 0,
    isBookedByMember: booking !== undefined,
    bookingId: booking?.id ?? null,
  };
};

/** HU-01: classes of today, tomorrow and the day after tomorrow that have not started, in time order. */
export class ListUpcomingClasses implements ListUpcomingClassesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(): Promise<Result<readonly UpcomingClass[], ListUpcomingClassesError>> {
    const { catalog, bookings, memberSession, clock, logger } = this.deps;

    let loaded: Catalog;
    try {
      loaded = await catalog.load();
    } catch {
      logger.error('catalog.load_failed');
      return err('CATALOG_UNAVAILABLE');
    }

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
      scheduleWindow(loaded.classes, today)
        .filter((session) => !hasStarted(session.startsAt, now))
        .sort(byStart)
        .map((session) => toView(session, memberBookings, today)),
    );
  }
}
