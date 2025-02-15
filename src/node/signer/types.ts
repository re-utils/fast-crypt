import type { BinaryLike, KeyObject } from 'node:crypto';

export type SignFn = (msg: string) => string;
export type VerifyFn = (msg: string) => string | undefined;
export type Signer = [SignFn, VerifyFn];

export type KeyData = BinaryLike | KeyObject;
