import type { ClassSession } from '../model/ClassSession';
import { sessionIdOf } from '../model/ClassSession';
import type { GymClass } from '../model/GymClass';
import type { BusinessDate } from '../time/businessTime';
import { addDays, sessionStart } from '../time/businessTime';

/** Today, tomorrow and the day after tomorrow. */
export const SCHEDULE_WINDOW_DAYS = 3;

/** Resolves a catalog class (relative day + time) into a dated session in Bogota. */
export function scheduleSession(gymClass: GymClass, today: BusinessDate): ClassSession {
  const date = addDays(today, gymClass.dayOffset);
  return {
    id: sessionIdOf(gymClass.id, date),
    classId: gymClass.id,
    name: gymClass.name,
    instructor: gymClass.instructor,
    date,
    startsAt: sessionStart(date, gymClass.startTime),
    durationMin: gymClass.durationMin,
    capacity: gymClass.capacity,
    takenByOthers: gymClass.takenByOthers,
  };
}

/** Sessions of the classes that fall inside the booking window starting today. */
export const scheduleWindow = (
  classes: readonly GymClass[],
  today: BusinessDate,
  windowDays: number = SCHEDULE_WINDOW_DAYS,
): ClassSession[] =>
  classes
    .filter((gymClass) => gymClass.dayOffset >= 0 && gymClass.dayOffset < windowDays)
    .map((gymClass) => scheduleSession(gymClass, today));
