import { z } from 'zod';

/**
 * Contract of the class catalog file delivered by the functional team (Spanish field names).
 * Everything that crosses this boundary is validated before the domain sees it.
 */
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const text = (max: number) => z.string().trim().min(1).max(max);

const classEntrySchema = z
  .object({
    id: text(20),
    nombre: text(60),
    instructor: text(80),
    diaOffset: z.number().int().nonnegative(),
    hora: z.string().regex(TIME_PATTERN),
    duracionMin: z.number().int().positive().max(600),
    cupoTotal: z.number().int().positive().max(1000),
    ocupados: z.number().int().nonnegative(),
  })
  .refine((entry) => entry.ocupados <= entry.cupoTotal, { message: 'ocupados exceeds cupoTotal' });

export const memberSchema = z.object({ id: text(40), nombre: text(80) });

export const catalogFileSchema = z.object({
  gimnasio: text(120),
  clases: z
    .array(classEntrySchema)
    .max(500)
    .refine((entries) => new Set(entries.map((entry) => entry.id)).size === entries.length, {
      message: 'duplicated class id',
    }),
});

export const memberFileSchema = z.object({ socio: memberSchema });

export type CatalogFile = z.infer<typeof catalogFileSchema>;
