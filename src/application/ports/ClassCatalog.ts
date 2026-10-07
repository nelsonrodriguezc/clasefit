import type { GymClass } from '@/domain/model/GymClass';

export interface Catalog {
  readonly gymName: string;
  readonly classes: readonly GymClass[];
}

/** Read-only source of the class catalog. Rejects when the catalog cannot be loaded or is invalid. */
export interface ClassCatalog {
  load(): Promise<Catalog>;
}
