export type SignFn = (msg: string) => string;
export type VerifyFn = (msg: string) => string | undefined;
export type Signer = [SignFn, VerifyFn];
