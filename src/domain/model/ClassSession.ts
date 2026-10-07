import type { BusinessDate } from '../time/businessTime';

/** Identifies one occurrence of a class: `${classId}@${YYYY-MM-DD}`. */
export type SessionId = string;

export const sessionIdOf = (classId: string, date: BusinessDate): SessionId => `${classId}@${date}`;

/** A concrete occurrence of a catalog class on a business date, with an absolute start instant. */
export interface ClassSession {
  readonly id: SessionId;
  readonly classId: string;
  readonly name: string;
  readonly instructor: string;
  readonly date: BusinessDate;
  /** Epoch milliseconds. */
  readonly startsAt: number;
  readonly durationMin: number;
  readonly capacity: number;
  readonly takenByOthers: number;
}
