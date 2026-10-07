import type { Booking } from '@/domain/model/Booking';
import type { ClassSession } from '@/domain/model/ClassSession';
import type { GymClass } from '@/domain/model/GymClass';
import type { Member } from '@/domain/model/Member';
import { parseBusinessDate, parseLocalTime, sessionStart } from '@/domain/time/businessTime';

/** Epoch milliseconds for an ISO-8601 instant (always written with an explicit Z or offset). */
export const at = (iso: string): number => {
  const epoch = Date.parse(iso);
  if (Number.isNaN(epoch)) throw new Error(`Invalid instant in test: ${iso}`);
  return epoch;
};

/** Reference "now" used across tests: Tuesday 2026-10-06, 10:00 in Bogotá (15:00 UTC). */
export const TUESDAY_10AM_BOGOTA = at('2026-10-06T10:00:00-05:00');
export const TODAY = parseBusinessDate('2026-10-06');
export const TOMORROW = parseBusinessDate('2026-10-07');
export const DAY_AFTER_TOMORROW = parseBusinessDate('2026-10-08');

export const LAURA: Member = { id: 'S-0001', name: 'Laura Gómez' };

export function aGymClass(overrides: Partial<GymClass> = {}): GymClass {
  return {
    id: 'C-99',
    name: 'Yoga',
    instructor: 'Valentina Ríos',
    dayOffset: 1,
    startTime: parseLocalTime('18:00'),
    durationMin: 60,
    capacity: 12,
    takenByOthers: 5,
    ...overrides,
  };
}

export function aSession(overrides: Partial<ClassSession> = {}): ClassSession {
  const date = overrides.date ?? TOMORROW;
  const classId = overrides.classId ?? 'C-99';
  return {
    id: `${classId}@${date}`,
    classId,
    name: 'Yoga',
    instructor: 'Valentina Ríos',
    date,
    startsAt: sessionStart(date, parseLocalTime('18:00')),
    durationMin: 60,
    capacity: 12,
    takenByOthers: 5,
    ...overrides,
  };
}

export function aBooking(overrides: Partial<Booking> = {}): Booking {
  const sessionDate = overrides.sessionDate ?? TOMORROW;
  const classId = overrides.classId ?? 'C-99';
  return {
    id: 'B-1',
    memberId: LAURA.id,
    sessionId: `${classId}@${sessionDate}`,
    classId,
    sessionDate,
    startsAt: sessionStart(sessionDate, parseLocalTime('18:00')),
    durationMin: 60,
    className: 'Yoga',
    instructor: 'Valentina Ríos',
    bookedAt: TUESDAY_10AM_BOGOTA,
    ...overrides,
  };
}
