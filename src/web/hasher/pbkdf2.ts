import { textEncoder } from '../coding';
import { toBytes, toHex } from '../polyfill/hex';
import timingSafeEqual from '../polyfill/timingSafeEqual';
import type { Hasher } from './types';

const ALG = { name: 'PBKDF2' };
const DERIVE_USAGES = ['deriveBits', 'deriveKey'] as const;
const ENCRYPT_USAGES = ['encrypt', 'decrypt'] as const;
const DERIVED_KEY_TYPE = { name: 'AES-GCM', length: 256 };

export interface HashOptions {
  salt?: Uint8Array; // Default to random values
  iterations?: number; // Default to 1e5
  hash?: string; // Default to SHA-256
}

// https://gist.github.com/pkmanas22/741ef650d5b02abe8e6412fab88d5b8f
export default ((options = ALG as any) => {
  // @ts-expect-error Set algorithm name
  options.name = 'PBKDF2';

  // Set default params
  options.salt ??= crypto.getRandomValues(new Uint8Array(16));
  options.iterations ??= 1e5;
  options.hash ??= 'SHA-256';

  const hash = async (pwd: string): Promise<Uint8Array> => new Uint8Array(await crypto.subtle.exportKey(
    'raw',
    await crypto.subtle.deriveKey(
      options as {
        name: 'PBKDF2',
        salt: Uint8Array,
        iterations: number,
        hash: string
      },

      await crypto.subtle.importKey(
        'raw',
        textEncoder.encode(pwd),
        ALG,
        false,
        ENCRYPT_USAGES
      ),

      DERIVED_KEY_TYPE,
      true,
      DERIVE_USAGES
    )
  ));

  return [
    (pwd) => hash(pwd).then(toHex),
    async (hashed, pwd) => {
      const hashedBytes = toBytes(hashed);
      return hashedBytes != null && timingSafeEqual(await hash(pwd), hashedBytes);
    }
  ];
}) as (options?: HashOptions) => Hasher;
