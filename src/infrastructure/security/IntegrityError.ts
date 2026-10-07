/**
 * Stored data failed authentication or validation: it was altered, is corrupt, has an unknown
 * format or cannot be decrypted with the current key. Callers must fail closed (discard it).
 */
export class IntegrityError extends Error {
  constructor(readonly reason: 'decrypt_failed' | 'invalid_envelope' | 'invalid_content' | 'invalid_key') {
    super('Stored data failed the integrity check');
    this.name = 'IntegrityError';
  }
}
