import { get, type SecretList } from './secrets.ts';
import {
  toBase64URL,
  fromBase64URL,
  type SecretKey,
  timingSafeEqual,
} from './utils.ts';
import { createHmac } from 'node:crypto';

export const sign = (
  algorithm: string,
  secret: SecretKey,
  value: string,
): string => {
  value = toBase64URL(value);
  return (
    value +
    '.' +
    createHmac(algorithm, secret).update(value).digest('base64url')
  );
};

export const signSecrets = (
  algorithm: string,
  secrets: SecretList,
  value: string,
): string => sign(algorithm, get(secrets), value);

export const verifyHash = (
  algorithm: string,
  secret: SecretKey,
  value: string,
  hash: string,
): string | undefined =>
  timingSafeEqual(
    createHmac(algorithm, secret).update(value).digest(),
    fromBase64URL(hash),
  )
    ? fromBase64URL(value).toString()
    : undefined;

export const verify = (
  algorithm: string,
  secret: SecretKey,
  value: string,
): string | undefined => {
  const idx = value.lastIndexOf('.');
  if (idx !== -1)
    return verifyHash(
      algorithm,
      secret,
      value.slice(0, idx),
      value.slice(idx + 1),
    );
};

export const verifySecrets = (
  algorithm: string,
  secrets: SecretList,
  value: string,
): string | undefined => {
  const idx = value.lastIndexOf('.');
  if (idx !== -1) {
    const realValue = value.slice(0, idx);
    const hash = value.slice(idx + 1);

    const pos = secrets[1];
    const list = secrets[0];

    // Loop from pos to end
    for (let i = pos; i < list.length; i++) {
      const val = verifyHash(algorithm, list[i], realValue, hash);
      if (val != null) return val;
    }

    // Loop from start to pos
    for (let i = 0; i < pos; i++) {
      const val = verifyHash(algorithm, list[i], realValue, hash);
      if (val != null) return val;
    }
  }
};
