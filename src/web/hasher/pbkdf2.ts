import { textEncoder } from '../coding';
import { toBytes, toHex } from '../polyfill/hex';
import timingSafeEqual from '../polyfill/timingSafeEqual';
import type { Hasher } from './types';

const DERIVE_USAGES = ['deriveBits', 'deriveKey'] as const;

export interface HashOptions {
  salt?: Uint8Array; // Default to random values
  iterations?: number; // Default to 1e5
  hash?: string; // Default to SHA-256
}

// https://webkit.org/demos/webcrypto/pbkdf2.html
export default ((options = {}) => {
  // @ts-expect-error Set algorithm name
  options.name = 'PBKDF2';

  // Set default params
  options.salt ??= crypto.getRandomValues(new Uint8Array(16));
  options.iterations ??= 1e5;
  options.hash ??= 'SHA-256';

  const length = options.salt.length * 8;

  // Hash to Uint8Array for later timingSafeEqual comparison
  const hash = async (pwd: string): Promise<Uint8Array> => new Uint8Array(await crypto.subtle.deriveBits(
    options as HashOptions & { name: 'PBKDF2' },
    await crypto.subtle.importKey(
      'raw',
      textEncoder.encode(pwd),
      'PBKDF2',
      false,
      DERIVE_USAGES
    ),
    length
  ));

  return [
    (pwd) => hash(pwd).then(toHex),
    async (hashed, pwd) => {
      const hashedBytes = toBytes(hashed);
      return hashedBytes != null && timingSafeEqual(await hash(pwd), hashedBytes);
    }
  ];
}) as (options?: HashOptions) => Hasher;
