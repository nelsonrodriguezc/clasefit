/**
 * Business time for ClaseFit: America/Bogota.
 *
 * Bogota has been UTC-05:00 all year since 1993 (no daylight saving time), so a fixed offset is
 * exact. Every calculation uses UTC getters on shifted instants: local Date getters (getHours,
 * getDate...) are forbidden here because they depend on the device time zone.
 */

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const BOGOTA_UTC_OFFSET_MS = -5 * HOUR_MS;

/** Calendar date in Bogota, formatted YYYY-MM-DD. Build it with parseBusinessDate or the helpers below. */
export type BusinessDate = string & { readonly __brand: 'BusinessDate' };

/** Wall-clock time of day in Bogota. */
export interface LocalTime {
  readonly hours: number;
  readonly minutes: number;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const pad = (value: number): string => String(value).padStart(2, '0');

const formatUtcDate = (date: Date): BusinessDate =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` as BusinessDate;

const utcMidnightOf = (date: BusinessDate): number => {
  const [, year, month, day] = DATE_PATTERN.exec(date) ?? [];
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
};

export function parseBusinessDate(value: string): BusinessDate {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new RangeError(`Invalid business date: "${value}"`);
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    throw new RangeError(`Invalid business date: "${value}"`);
  }
  return value as BusinessDate;
}

export function parseLocalTime(value: string): LocalTime {
  const match = TIME_PATTERN.exec(value);
  if (!match) throw new RangeError(`Invalid time (expected HH:mm): "${value}"`);
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export const formatLocalTime = (time: LocalTime): string => `${pad(time.hours)}:${pad(time.minutes)}`;

/** Calendar date in Bogota for an absolute instant. */
export const businessDateOf = (epochMs: number): BusinessDate =>
  formatUtcDate(new Date(epochMs + BOGOTA_UTC_OFFSET_MS));

/** Wall-clock time in Bogota for an absolute instant. */
export function localTimeOf(epochMs: number): LocalTime {
  const shifted = new Date(epochMs + BOGOTA_UTC_OFFSET_MS);
  return { hours: shifted.getUTCHours(), minutes: shifted.getUTCMinutes() };
}

export function datePartsOf(date: BusinessDate): { year: number; month: number; day: number } {
  const shifted = new Date(utcMidnightOf(date));
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

export const addDays = (date: BusinessDate, days: number): BusinessDate =>
  formatUtcDate(new Date(utcMidnightOf(date) + days * DAY_MS));

export const daysBetween = (from: BusinessDate, to: BusinessDate): number =>
  Math.round((utcMidnightOf(to) - utcMidnightOf(from)) / DAY_MS);

/** Day of the week of a business date (0 = Sunday ... 6 = Saturday). */
export const weekdayOf = (date: BusinessDate): number => new Date(utcMidnightOf(date)).getUTCDay();

/** Absolute instant (epoch ms) of a Bogota wall-clock time on a business date. */
export const sessionStart = (date: BusinessDate, time: LocalTime): number =>
  utcMidnightOf(date) + time.hours * HOUR_MS + time.minutes * MINUTE_MS - BOGOTA_UTC_OFFSET_MS;

/** A class has started when its start instant is now or in the past. */
export const hasStarted = (startsAt: number, now: number): boolean => startsAt <= now;
