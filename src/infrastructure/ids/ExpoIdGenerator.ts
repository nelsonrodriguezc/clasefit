import { randomUUID } from 'expo-crypto';

import type { IdGenerator } from '@/application/ports/IdGenerator';

/** Random UUID v4 from the platform CSPRNG: booking ids are unique and not guessable. */
export class ExpoIdGenerator implements IdGenerator {
  next(): string {
    return randomUUID();
  }
}
