import type { LocalTime } from '../time/businessTime';

/** A group class as published in the catalog: relative day + Bogota wall-clock time. */
export interface GymClass {
  readonly id: string;
  readonly name: string;
  readonly instructor: string;
  /** 0 = today, 1 = tomorrow, 2 = the day after tomorrow (in Bogota). */
  readonly dayOffset: number;
  readonly startTime: LocalTime;
  readonly durationMin: number;
  /** Total spots (cupoTotal). */
  readonly capacity: number;
  /** Spots already taken by other members (ocupados); the member's own bookings are added on top. */
  readonly takenByOthers: number;
}
