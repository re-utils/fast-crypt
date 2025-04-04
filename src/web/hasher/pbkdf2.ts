import { cmpBufferWithUint8Array, textEncoder } from '../coding.js';
import { toBytes, toHexTable } from '../polyfill/hex.js';
import type { HashAlgorithm } from '../types.js';
import type { Hasher } from './types.js';

const DERIVE_USAGES = ['deriveBits'] as const;

export interface HashOptions {
  salt?: number;
  iterations?: number; // Default to 1e5
  hash?: HashAlgorithm; // Default to SHA-256
}

// https://webkit.org/demos/webcrypto/pbkdf2.html
export default ((options = {}) => {
  // @ts-expect-error Make options the prototype
  options.name = 'PBKDF2';
  options.iterations ??= 1e5;
  const alg = (options.hash ??= 'SHA-256');

  // Select correct size for output to avoid unnecessary rehashing
  // https://www.chosenplaintext.ca/2015/10/08/pbkdf2-design-flaw.html
  const outputBitLen = +alg.slice(4);

  // Hash password to Uint8Array
  const hash = async (pwd: string, salt: Uint8Array): Promise<ArrayBuffer> => {
    const opts = Object.create(options);
    // eslint-disable-next-line
    opts.salt = salt;

    return crypto.subtle.deriveBits(
      opts,
      await crypto.subtle.importKey(
        'raw',
        textEncoder.encode(pwd),
        'PBKDF2',
        false,
        DERIVE_USAGES,
      ),
      outputBitLen,
    );
  };

  // Expected length
  const outputLen = outputBitLen >>> 3;
  const saltLen = options.salt ?? 16;

  // The expected positions
  const sepPos = saltLen << 1;
  const outputPos = sepPos + 1;
  const expectedLen = outputPos + (outputLen << 1);

  return [
    async (pwd) => {
      let str = '';

      // Convert salt to hex
      const salt = crypto.getRandomValues(new Uint8Array(saltLen));
      for (let i = 0; i < salt.length; i++) str += toHexTable[salt[i]];

      // Separate salt and payload
      str += '.';

      // Convert payload to hex
      const buf = new DataView(await hash(pwd, salt));
      for (let i = 0; i < buf.byteLength; i++)
        str += toHexTable[buf.getUint8(i)];

      return str;
    },

    async (hashed, pwd) => {
      if (hashed.length === expectedLen && hashed.charCodeAt(sepPos) === 46) {
        const salt = toBytes(hashed, 0, saltLen);
        const hashedPwd = toBytes(hashed, outputPos, outputLen);

        if (salt != null && hashedPwd != null)
          return cmpBufferWithUint8Array(await hash(pwd, salt), hashedPwd);
      }

      return false;
    },
  ];
}) as (options?: HashOptions) => Hasher;
