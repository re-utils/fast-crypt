import { decodeBase64Url, textEncoder, textDecoder, encodeBase64Url } from '../coding.js';
import type { Algorithm } from './algorithm.js';
import getKeyAlg from './algorithm.js';
import { importPrivateKey, importPublicKey, type SignatureKey } from './key.js';

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

export default async <T extends Record<string, unknown> = Record<string, unknown>>(key: SignatureKey | CryptoKeyPair, algorithm?: Algorithm): Promise<[
  sign: (payload: T & JWTPayload) => Promise<string>,
  verify: (token: string) => Promise<T | JWTError>
]> => {
  const [privateKey, publicKey] = (key as CryptoKeyPair).privateKey instanceof CryptoKey
    ? [(key as CryptoKeyPair).privateKey, (key as CryptoKeyPair).publicKey]
    : [key as SignatureKey, key as SignatureKey];

  // @ts-expect-error Check for key algorithm
  const algName: Algorithm = privateKey.alg ?? algorithm ?? 'HS256';
  const selectedAlgorithm = getKeyAlg(algName);

  // Prepare encoded headers
  // @ts-expect-error Check for key algorithm
  const encodedHeader = encodePart({ alg: algName, typ: 'JWT', kid: privateKey.alg }) + '.';

  // Prepare keys
  const importedPrivateKey = await importPrivateKey(privateKey, selectedAlgorithm);
  const importedPublicKey = await importPublicKey(publicKey, selectedAlgorithm);

  return [
    async (payload) => {
      const partialToken = encodedHeader + encodePart(payload);
      return partialToken + '.' + encodeBase64Url(new Uint8Array(await crypto.subtle.sign(selectedAlgorithm, importedPrivateKey, textEncoder.encode(partialToken))));
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
                return Symbol.for('nbf') as JWTError;

              if (typeof payload.exp === 'number' && payload.exp <= now)
                return Symbol.for('exp') as JWTError;

              // Verify the payload
              return await crypto.subtle.verify(
                selectedAlgorithm,
                importedPublicKey,
                decodeBase64Url(token.substring(delimIdx + 1)),
                textEncoder.encode(token.substring(0, delimIdx))
              )
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
