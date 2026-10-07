import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { DisciplineCopy } from './messages';
import { DEFAULT_DISCIPLINE_COPY, DISCIPLINE_COPY } from './messages';

export type DisciplineIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface Discipline {
  readonly icon: DisciplineIconName;
  readonly description: string;
  readonly tags: readonly { readonly label: string; readonly icon: DisciplineIconName }[];
}

/** Icon instead of a photo for each discipline (assumption UI-2). */
const DISCIPLINE_ICONS: Readonly<Record<string, DisciplineIconName>> = {
  Spinning: 'bike',
  Funcional: 'weight-lifter',
  Yoga: 'yoga',
  Rumba: 'dance-ballroom',
};

const TAG_ICONS: Readonly<Record<string, DisciplineIconName>> = {
  Cardio: 'heart-pulse',
  Fuerza: 'dumbbell',
  Resistencia: 'fire',
  Movilidad: 'run',
  Core: 'target',
  Flexibilidad: 'human-handsup',
  Equilibrio: 'scale-balance',
  Respiración: 'weather-windy',
  Coordinación: 'shoe-print',
  Ritmo: 'music-note',
};

const GENERIC_ICON: DisciplineIconName = 'arm-flex';

/** Visual identity of a class, looked up by its name; unknown names get a generic icon and copy. */
export const disciplineOf = (className: string): Discipline => {
  const copy: DisciplineCopy = DISCIPLINE_COPY[className] ?? DEFAULT_DISCIPLINE_COPY;
  return {
    icon: DISCIPLINE_ICONS[className] ?? GENERIC_ICON,
    description: copy.description,
    tags: copy.tags.map((label) => ({ label, icon: TAG_ICONS[label] ?? GENERIC_ICON })),
  };
};
