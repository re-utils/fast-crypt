import { decodeBase64Url, textEncoder, textDecoder, encodeBase64Url } from '../coding';
import type { Algorithm } from './algorithm';
import getKeyAlg from './algorithm';
import { importPrivateKey, importPublicKey, type SignatureKey } from './key';

export interface TokenHeader {
  alg: Algorithm;
  typ?: 'JWT';
  kid?: string;
}

export interface JWTPayload {
  /**
   * Ensure the token has not expired.
   */
  exp?: number;

  /**
   * Ensure the token is not being used before a specified time.
   */
  nbf?: number;
}

export const encodePart = (part: unknown): string => encodeBase64Url(textEncoder.encode(JSON.stringify(part)));
export const decodePart = (part: string): unknown => JSON.parse(textDecoder.decode(decodeBase64Url(part)));

export type JWTError = symbol & {
  description: 'invalid' | 'nbf' | 'exp' | 'mismatch'
};

export default async <T extends Record<string, unknown> = Record<string, unknown>>(key: SignatureKey | [privateKey: SignatureKey, publicKey: SignatureKey], algorithm?: Algorithm): Promise<[
  sign: (payload: T & JWTPayload) => Promise<string>,
  verify: (token: string) => Promise<T | JWTError>
]> => {
  const [privateKey, publicKey] = Array.isArray(key) ? key : [key, key];

  // @ts-expect-error Check for key algorithm
  const alg = getKeyAlg(privateKey.alg ?? algorithm ?? 'HS256');

  // Prepare encoded headers
  // @ts-expect-error Check for key algorithm
  const encodedHeader = encodePart({ alg, typ: 'JWT', kid: privateKey.alg }) + '.';

  // Prepare keys
  const importedPrivateKey = await importPrivateKey(privateKey, alg);
  const importedPublicKey = await importPublicKey(publicKey, alg);

  return [
    async (payload) => {
      const partialToken = encodedHeader + encodePart(payload);
      return partialToken + '.' + encodeBase64Url(new Uint8Array(await crypto.subtle.sign(alg, importedPrivateKey, textEncoder.encode(partialToken))));
    },

    async (token) => {
      if (token.startsWith(encodedHeader)) {
        // Delimiter between (header).(payload) and signature
        const delimIdx = token.indexOf('.', encodedHeader.length);

        if (delimIdx !== -1) {
          try {
            const payload = decodePart(token.substring(encodedHeader.length, delimIdx)) as JWTPayload | null;

            if (typeof payload === 'object' && payload !== null) {
              // Check dates
              const now = Date.now() / 1000 >>> 0;

              if (typeof payload.nbf === 'number' && payload.nbf > now)
                return Symbol.for('not-before') as JWTError;

              if (typeof payload.exp === 'number' && payload.exp <= now)
                return Symbol.for('expired') as JWTError;

              // Verify the payload
              return await crypto.subtle.verify(alg, importedPublicKey, decodeBase64Url(token.substring(delimIdx + 1)), textEncoder.encode(token.substring(0, delimIdx)))
                ? payload as T
                : Symbol.for('mismatch') as JWTError;
            }
          } catch { }
        }
      }

      return Symbol.for('invalid') as JWTError;
    }
  ];
};
