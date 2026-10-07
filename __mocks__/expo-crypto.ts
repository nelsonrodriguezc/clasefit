/**
 * Jest double of expo-crypto (used automatically for the node_modules package).
 *
 * It implements the same AES-GCM API with Node's WebCrypto, so tests exercise real authenticated
 * encryption: tampering, a wrong key or different associated data really fail. Like the native
 * module, string inputs are interpreted as base64 and combined data is IV || ciphertext || tag.
 */
import { randomUUID as nodeRandomUUID, webcrypto } from 'node:crypto';

type BinaryInput = string | Uint8Array | ArrayBuffer;
type Encoding = 'bytes' | 'base64';

const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const HEX = /^(?:[0-9a-fA-F]{2})+$/;

const toBytes = (input: BinaryInput): Uint8Array => {
  if (typeof input === 'string') return new Uint8Array(Buffer.from(input, 'base64'));
  return input instanceof ArrayBuffer ? new Uint8Array(input) : input;
};

const encode = (bytes: Uint8Array, encoding: Encoding): Uint8Array | string =>
  encoding === 'base64' ? Buffer.from(bytes).toString('base64') : new Uint8Array(bytes);

const randomBytes = (length: number): Uint8Array => webcrypto.getRandomValues(new Uint8Array(length));

export enum AESKeySize {
  AES128 = 128,
  AES192 = 192,
  AES256 = 256,
}

export class AESEncryptionKey {
  private constructor(private readonly raw: Uint8Array) {}

  static async generate(size: AESKeySize = AESKeySize.AES256): Promise<AESEncryptionKey> {
    return new AESEncryptionKey(randomBytes(size / 8));
  }

  static async import(input: Uint8Array | string, encoding?: 'hex' | 'base64'): Promise<AESEncryptionKey> {
    let bytes: Uint8Array;
    if (typeof input !== 'string') bytes = input;
    else if (encoding === 'hex') {
      if (!HEX.test(input)) throw new Error('Invalid hex key');
      bytes = new Uint8Array(Buffer.from(input, 'hex'));
    } else bytes = new Uint8Array(Buffer.from(input, 'base64'));
    if (![16, 24, 32].includes(bytes.length)) throw new Error('Invalid key length');
    return new AESEncryptionKey(bytes);
  }

  get size(): AESKeySize {
    return (this.raw.length * 8) as AESKeySize;
  }

  async bytes(): Promise<Uint8Array> {
    return new Uint8Array(this.raw);
  }

  async encoded(encoding: 'hex' | 'base64'): Promise<string> {
    return Buffer.from(this.raw).toString(encoding);
  }

  /** Test-double internal: WebCrypto key for AES-GCM. */
  toCryptoKey() {
    return webcrypto.subtle.importKey('raw', this.raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
}

export class AESSealedData {
  private constructor(
    private readonly bytes: Uint8Array,
    readonly ivSize: number,
    readonly tagSize: number,
  ) {}

  static fromCombined(combined: BinaryInput, config?: { ivLength?: number; tagLength?: number }): AESSealedData {
    // Android's native fromCombined only accepts a Uint8Array (ByteArray); the JS typings also allow
    // a base64 string, which works on iOS/web but throws on Android. Mirror the strictest platform.
    if (typeof combined === 'string') throw new TypeError('fromCombined expects a Uint8Array on Android');
    const bytes = toBytes(combined);
    const ivLength = config?.ivLength ?? IV_LENGTH;
    const tagLength = config?.tagLength ?? TAG_LENGTH;
    if (bytes.length < ivLength + tagLength) throw new Error('Sealed data is too short');
    return new AESSealedData(new Uint8Array(bytes), ivLength, tagLength);
  }

  get combinedSize(): number {
    return this.bytes.length;
  }

  async combined(encoding: Encoding = 'bytes'): Promise<any> {
    return encode(this.bytes, encoding);
  }

  async iv(encoding: Encoding = 'bytes'): Promise<any> {
    return encode(this.bytes.slice(0, this.ivSize), encoding);
  }
}

interface EncryptOptions {
  nonce?: { length: number } | { bytes: BinaryInput };
  tagLength?: number;
  additionalData?: BinaryInput;
}

export async function aesEncryptAsync(
  plaintext: BinaryInput,
  key: AESEncryptionKey,
  options: EncryptOptions = {},
): Promise<AESSealedData> {
  const iv = options.nonce && 'bytes' in options.nonce ? toBytes(options.nonce.bytes) : randomBytes(options.nonce?.length ?? IV_LENGTH);
  const tagLength = options.tagLength ?? TAG_LENGTH;
  const params = {
    name: 'AES-GCM',
    iv,
    tagLength: tagLength * 8,
    ...(options.additionalData ? { additionalData: toBytes(options.additionalData) } : {}),
  };
  const encrypted = new Uint8Array(await webcrypto.subtle.encrypt(params, await key.toCryptoKey(), toBytes(plaintext)));
  const combined = new Uint8Array(iv.length + encrypted.length);
  combined.set(iv);
  combined.set(encrypted, iv.length);
  return AESSealedData.fromCombined(combined, { ivLength: iv.length, tagLength });
}

export async function aesDecryptAsync(
  sealed: AESSealedData,
  key: AESEncryptionKey,
  options: { output?: Encoding; additionalData?: BinaryInput } = {},
): Promise<any> {
  const combined: Uint8Array = await sealed.combined('bytes');
  const params = {
    name: 'AES-GCM',
    iv: combined.slice(0, sealed.ivSize),
    tagLength: sealed.tagSize * 8,
    ...(options.additionalData ? { additionalData: toBytes(options.additionalData) } : {}),
  };
  const plain = new Uint8Array(
    await webcrypto.subtle.decrypt(params, await key.toCryptoKey(), combined.slice(sealed.ivSize)),
  );
  return encode(plain, options.output ?? 'bytes');
}

export const getRandomBytes = (byteCount: number): Uint8Array => randomBytes(byteCount);

export const randomUUID = (): string => nodeRandomUUID();
