import type { Clock } from '@/application/ports/Clock';
import type { Catalog, ClassCatalog } from '@/application/ports/ClassCatalog';
import type { BookingRepository } from '@/application/ports/BookingRepository';
import type { IdGenerator } from '@/application/ports/IdGenerator';
import type { LogEvent, Logger, LogMeta } from '@/application/ports/Logger';
import type { MemberSession } from '@/application/ports/MemberSession';
import type { Booking } from '@/domain/model/Booking';
import type { GymClass } from '@/domain/model/GymClass';
import type { Member } from '@/domain/model/Member';

/** Deterministic clock: tests move time explicitly. */
export class FixedClock implements Clock {
  constructor(private current: number) {}
  now(): number {
    return this.current;
  }
  set(epochMs: number): void {
    this.current = epochMs;
  }
  advance(ms: number): void {
    this.current += ms;
  }
}

export class InMemoryCatalog implements ClassCatalog {
  constructor(
    private readonly classes: readonly GymClass[],
    private readonly gymName = 'ClaseFit · Sede Laureles',
  ) {}
  async load(): Promise<Catalog> {
    return { gymName: this.gymName, classes: this.classes };
  }
}

export class BrokenCatalog implements ClassCatalog {
  async load(): Promise<Catalog> {
    throw new Error('invalid catalog');
  }
}

export class StaticMemberSession implements MemberSession {
  constructor(private readonly member: Member) {}
  async current(): Promise<Member> {
    return this.member;
  }
}

/** Member data that fails validation (like an invalid bundled file). */
export class BrokenMemberSession implements MemberSession {
  async current(): Promise<Member> {
    throw new Error('invalid member');
  }
}

export class SequentialIds implements IdGenerator {
  private counter = 0;
  next(): string {
    this.counter += 1;
    return `B-${this.counter}`;
  }
}

export class RecordingLogger implements Logger {
  readonly entries: { level: 'info' | 'warn' | 'error'; event: LogEvent; meta?: LogMeta }[] = [];
  info(event: LogEvent, meta?: LogMeta): void {
    this.entries.push({ level: 'info', event, meta });
  }
  warn(event: LogEvent, meta?: LogMeta): void {
    this.entries.push({ level: 'warn', event, meta });
  }
  error(event: LogEvent, meta?: LogMeta): void {
    this.entries.push({ level: 'error', event, meta });
  }
  events(): LogEvent[] {
    return this.entries.map((entry) => entry.event);
  }
}

/**
 * Simple asynchronous repository used by application tests. Every method yields to the event
 * loop, so concurrent use cases interleave exactly like they would with real storage.
 */
export class FakeBookingRepository implements BookingRepository {
  private bookings: Booking[] = [];
  failWrites = false;
  failReads = false;

  constructor(initial: readonly Booking[] = []) {
    this.bookings = [...initial];
  }

  async findByMember(memberId: string): Promise<readonly Booking[]> {
    await Promise.resolve();
    if (this.failReads) throw new Error('read failed');
    return this.bookings.filter((booking) => booking.memberId === memberId);
  }

  async add(booking: Booking): Promise<void> {
    await Promise.resolve();
    if (this.failWrites) throw new Error('write failed');
    this.bookings = [...this.bookings, booking];
  }

  async remove(bookingIds: readonly string[]): Promise<void> {
    await Promise.resolve();
    if (this.failWrites) throw new Error('write failed');
    this.bookings = this.bookings.filter((booking) => !bookingIds.includes(booking.id));
  }

  all(): readonly Booking[] {
    return this.bookings;
  }
}
