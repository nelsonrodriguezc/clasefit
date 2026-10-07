import { z } from 'zod';

import { IntegrityError } from '../security/IntegrityError';
import type { Cipher } from '../security/ports';
import type { KeyValueStore } from './KeyValueStore';

const VERSION = 1;
const ALGORITHM = 'A256GCM';

const envelopeSchema = z.object({ v: z.literal(VERSION), alg: z.literal(ALGORITHM), data: z.string().min(1) }).strict();

/** Associated data: binds each ciphertext to its storage slot and format version. */
const associatedDataFor = (key: string): string => `clasefit|${key}|v${VERSION}`;

/**
 * Decorator that encrypts every value of an inner KeyValueStore (open/closed: the inner store and
 * its users do not change). Stored format: {"v":1,"alg":"A256GCM","data":"<base64>"}.
 */
export class EncryptedKeyValueStore implements KeyValueStore {
  constructor(
    private readonly inner: KeyValueStore,
    private readonly cipher: Cipher,
  ) {}

  async getItem(key: string): Promise<string | null> {
    const raw = await this.inner.getItem(key);
    if (raw === null) return null;
    let envelope: z.infer<typeof envelopeSchema>;
    try {
      envelope = envelopeSchema.parse(JSON.parse(raw));
    } catch {
      throw new IntegrityError('invalid_envelope');
    }
    return this.cipher.open(envelope.data, associatedDataFor(key));
  }

  async setItem(key: string, value: string): Promise<void> {
    const data = await this.cipher.seal(value, associatedDataFor(key));
    await this.inner.setItem(key, JSON.stringify({ v: VERSION, alg: ALGORITHM, data }));
  }

  removeItem(key: string): Promise<void> {
    return this.inner.removeItem(key);
  }
}
