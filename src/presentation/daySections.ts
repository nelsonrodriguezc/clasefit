import type { UpcomingClass } from '@/application/views';
import type { BusinessDate } from '@/domain/time/businessTime';

export interface DaySection {
  readonly daysFromToday: number;
  readonly date: BusinessDate;
  readonly items: readonly UpcomingClass[];
}

/** Groups the (already time-ordered) classes by day, keeping the order of the days. */
export const groupByDay = (items: readonly UpcomingClass[]): DaySection[] => {
  const sections: { daysFromToday: number; date: BusinessDate; items: UpcomingClass[] }[] = [];
  for (const item of items) {
    const last = sections[sections.length - 1];
    if (last && last.daysFromToday === item.daysFromToday) last.items.push(item);
    else sections.push({ daysFromToday: item.daysFromToday, date: item.date, items: [item] });
  }
  return sections;
};

/**
 * Day whose section is at the top of the visible area: the last section that starts at or above
 * `visibleTop`. Before the first section (greeting still visible) it is the first day.
 */
export const dayAtOffset = (
  sectionOffsets: ReadonlyMap<number, number>,
  visibleTop: number,
  fallback: number | null,
): number | null => {
  let current = fallback;
  let bestOffset = -Infinity;
  for (const [day, offset] of sectionOffsets) {
    if (offset <= visibleTop && offset > bestOffset) {
      current = day;
      bestOffset = offset;
    }
  }
  return current;
};
