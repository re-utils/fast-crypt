import {
  type BinaryLike,
  type KeyObject,
  timingSafeEqual as tseq,
} from 'node:crypto';
import { Buffer } from 'node:buffer';

export type SecretKey = BinaryLike | KeyObject;

export const timingSafeEqual = (
  a: NodeJS.ArrayBufferView,
  b: NodeJS.ArrayBufferView,
): boolean => a.byteLength === b.byteLength && tseq(a, b);

export const toBase64URL = (str: string): string => Buffer.from(str).toString('base64url');
export const fromBase64URL = (str: string): Buffer => Buffer.from(str, 'base64url');
