import { SerialTaskQueue } from '@/application/concurrency/SerialTaskQueue';
import type { BookingRepository } from '@/application/ports/BookingRepository';
import type { ClassCatalog } from '@/application/ports/ClassCatalog';
import type { MemberSession } from '@/application/ports/MemberSession';
import type { TaskQueue } from '@/application/ports/TaskQueue';
import { BookClass } from '@/application/use-cases/BookClass';
import { CancelBooking } from '@/application/use-cases/CancelBooking';
import { GetMemberProfile } from '@/application/use-cases/GetMemberProfile';
import { ListMyBookings } from '@/application/use-cases/ListMyBookings';
import { ListUpcomingClasses } from '@/application/use-cases/ListUpcomingClasses';
import { PurgeExpiredBookings } from '@/application/use-cases/PurgeExpiredBookings';
import type { Booking } from '@/domain/model/Booking';
import type { Member } from '@/domain/model/Member';
import type { BookingRule } from '@/domain/rules/BookingRule';
import { defaultBookingRules, defaultCancellationRules } from '@/domain/rules/policies';

import { LAURA, TUESDAY_10AM_BOGOTA } from './builders';
import { INSUMO_CLASSES } from './catalogFixture';
import { FakeBookingRepository, FixedClock, InMemoryCatalog, RecordingLogger, SequentialIds, StaticMemberSession } from './fakes';

export interface HarnessOptions {
  now?: number;
  bookings?: readonly Booking[];
  catalog?: ClassCatalog;
  repository?: BookingRepository;
  bookingRules?: readonly BookingRule[];
  queue?: TaskQueue;
  /** The authenticated member (Laura by default). */
  member?: Member;
  /** Replaces the member session entirely (e.g. with one that fails). */
  memberSession?: MemberSession;
}

/** Wires every use case with deterministic test doubles, exactly like src/di does with real adapters. */
export function createUseCases(options: HarnessOptions = {}) {
  const clock = new FixedClock(options.now ?? TUESDAY_10AM_BOGOTA);
  const repository = options.repository ?? new FakeBookingRepository(options.bookings ?? []);
  const catalog = options.catalog ?? new InMemoryCatalog(INSUMO_CLASSES);
  const memberSession = options.memberSession ?? new StaticMemberSession(options.member ?? LAURA);
  const logger = new RecordingLogger();
  const queue = options.queue ?? new SerialTaskQueue();
  const ids = new SequentialIds();

  return {
    clock,
    repository,
    logger,
    listUpcomingClasses: new ListUpcomingClasses({ catalog, bookings: repository, memberSession, clock, logger }),
    bookClass: new BookClass({
      catalog,
      bookings: repository,
      memberSession,
      clock,
      ids,
      queue,
      logger,
      rules: options.bookingRules ?? defaultBookingRules(),
    }),
    listMyBookings: new ListMyBookings({ bookings: repository, memberSession, clock, logger }),
    cancelBooking: new CancelBooking({
      bookings: repository,
      memberSession,
      clock,
      queue,
      logger,
      rules: defaultCancellationRules(),
    }),
    purgeExpiredBookings: new PurgeExpiredBookings({ bookings: repository, memberSession, clock, queue, logger }),
    getMemberProfile: new GetMemberProfile({ memberSession, logger }),
  };
}
