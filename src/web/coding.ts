export const textEncoder: TextEncoder = new TextEncoder();
export const textDecoder: TextDecoder = new TextDecoder();

// TODO: Optimizations if possible
export const decodeBase64 = (str: string): Uint8Array => Uint8Array.from(atob(str), (m) => m.codePointAt(0)!);
export const decodeBase64Url = (str: string): Uint8Array => decodeBase64(str.replace(/[_-]/g, (m) => m === '_' ? '/' : '+'));

export const encodeBase64 = (buf: Uint8Array): string => btoa(String.fromCharCode(...buf));
export const encodeBase64Url = (buf: Uint8Array): string => encodeBase64(buf).replace(/[/+]/g, (m) => m === '/' ? '_' : '-');
