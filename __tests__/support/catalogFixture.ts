import type { GymClass } from '@/domain/model/GymClass';
import { parseLocalTime } from '@/domain/time/businessTime';

type Row = [id: string, name: string, instructor: string, dayOffset: number, time: string, durationMin: number, capacity: number, takenByOthers: number];

// Same data as docs/insumo/mock-data/clases.json (C-03 and C-08 full; C-06 and C-10 with one spot).
const rows: Row[] = [
  ['C-01', 'Spinning', 'Andrés Restrepo', 0, '06:00', 45, 20, 18],
  ['C-02', 'Funcional', 'Camila Ospina', 0, '18:00', 60, 15, 9],
  ['C-03', 'Yoga', 'Valentina Ríos', 0, '19:00', 60, 12, 12],
  ['C-04', 'Rumba', 'Julián Mejía', 0, '20:00', 50, 30, 22],
  ['C-05', 'Spinning', 'Andrés Restrepo', 1, '06:00', 45, 20, 11],
  ['C-06', 'Funcional', 'Camila Ospina', 1, '07:00', 60, 15, 14],
  ['C-07', 'Yoga', 'Valentina Ríos', 1, '18:00', 60, 12, 5],
  ['C-08', 'Rumba', 'Julián Mejía', 1, '19:00', 50, 30, 30],
  ['C-09', 'Spinning', 'Andrés Restrepo', 2, '08:00', 45, 20, 13],
  ['C-10', 'Yoga', 'Valentina Ríos', 2, '09:00', 60, 12, 11],
];

export const INSUMO_CLASSES: readonly GymClass[] = rows.map(
  ([id, name, instructor, dayOffset, time, durationMin, capacity, takenByOthers]) => ({
    id,
    name,
    instructor,
    dayOffset,
    startTime: parseLocalTime(time),
    durationMin,
    capacity,
    takenByOthers,
  }),
);
