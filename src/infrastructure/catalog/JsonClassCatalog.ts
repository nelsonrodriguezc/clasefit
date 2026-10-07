import type { Catalog, ClassCatalog } from '@/application/ports/ClassCatalog';
import type { GymClass } from '@/domain/model/GymClass';
import { parseLocalTime } from '@/domain/time/businessTime';

import type { CatalogFile } from './catalogSchema';
import { catalogFileSchema } from './catalogSchema';

/** The message never includes the offending values: the data could be personal or sensitive. */
export class CatalogValidationError extends Error {
  constructor() {
    super('Invalid class catalog');
    this.name = 'CatalogValidationError';
  }
}

const toGymClass = (entry: CatalogFile['clases'][number]): GymClass => ({
  id: entry.id,
  name: entry.nombre,
  instructor: entry.instructor,
  dayOffset: entry.diaOffset,
  startTime: parseLocalTime(entry.hora),
  durationMin: entry.duracionMin,
  capacity: entry.cupoTotal,
  takenByOthers: entry.ocupados,
});

/** ClassCatalog over the bundled JSON: validates once (anti-corruption layer) and caches the result. */
export class JsonClassCatalog implements ClassCatalog {
  private cached?: Catalog;

  constructor(private readonly raw: unknown) {}

  async load(): Promise<Catalog> {
    if (this.cached) return this.cached;
    const parsed = catalogFileSchema.safeParse(this.raw);
    if (!parsed.success) throw new CatalogValidationError();
    this.cached = { gymName: parsed.data.gimnasio, classes: parsed.data.clases.map(toGymClass) };
    return this.cached;
  }
}
