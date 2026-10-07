import { z } from 'zod';

import type { Booking } from '@/domain/model/Booking';
import { parseBusinessDate } from '@/domain/time/businessTime';

const businessDate = z.string().transform((value, context) => {
  try {
    return parseBusinessDate(value);
  } catch {
    context.addIssue({ code: 'custom', message: 'invalid business date' });
    return z.NEVER;
  }
});

const epochMs = z.number().int().nonnegative();

/** Strict shape of a persisted booking: unknown fields are rejected, not silently kept. */
const bookingSchema = z
  .object({
    id: z.string().min(1).max(64),
    memberId: z.string().min(1).max(40),
    sessionId: z.string().min(1).max(64),
    classId: z.string().min(1).max(20),
    sessionDate: businessDate,
    startsAt: epochMs,
    durationMin: z.number().int().positive().max(600),
    className: z.string().min(1).max(60),
    instructor: z.string().min(1).max(80),
    bookedAt: epochMs,
  })
  .strict();

export const storedBookingsSchema = z.array(bookingSchema).max(1000);

export const parseStoredBookings = (json: string): Booking[] | undefined => {
  try {
    const parsed = storedBookingsSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
};
