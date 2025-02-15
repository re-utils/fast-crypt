import type { BinaryLike, KeyObject } from 'node:crypto';

export type Signer = (msg: string) => string;
export type Verifier = (msg: string) => string | null;

export type KeyData = BinaryLike | KeyObject;
