import { type Secret, timingSafeEqual } from './utils.js';
import { createHmac } from 'node:crypto';
import { Buffer } from 'node:buffer';

export const sign = (
  algorithm: string,
  secret: Secret,
  value: string,
): string =>
  value + '.' + createHmac(algorithm, secret).update(value).digest('base64url');

export const verify = (
  algorithm: string,
  secret: Secret,
  value: string,
): string | undefined => {
  const idx = value.lastIndexOf('.');
  if (idx !== -1) {
    const extractedVal = value.substring(0, idx);

    if (
      timingSafeEqual(
        createHmac(algorithm, secret).update(extractedVal).digest(),
        Buffer.from(value.substring(idx + 1), 'base64url'),
      )
    )
      return extractedVal;
  }
};
