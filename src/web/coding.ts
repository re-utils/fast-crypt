export const textEncoder: TextEncoder = new TextEncoder();
export const textDecoder: TextDecoder = new TextDecoder();

// TODO: Optimizations if possible
export const decodeBase64UrlToString = (str: string): string => atob(str.replace(/[_-]/g, (m) => m === '_' ? '/' : '+'));
export const stringToByteArray = (str: string): Uint8Array => Uint8Array.from(str, (m) => m.charCodeAt(0));

export const decodeBase64 = (str: string): Uint8Array => stringToByteArray(atob(str));
export const decodeBase64Url = (str: string): Uint8Array => stringToByteArray(decodeBase64UrlToString(str));

export const encodeBase64 = (buf: Uint8Array): string => btoa(String.fromCharCode(...buf));
export const encodeBase64Url = (buf: Uint8Array): string => encodeBase64(buf).replace(/[/+=]/g, (m) => m === '/' ? '_' : m === '+' ? '-' : '');

export const cmpBufferWithUint8Array = (a: ArrayBuffer, b: Uint8Array): boolean => {
  if (a.byteLength === b.length) {
    const view = new DataView(a);

    let res = 0;
    for (let i = 0; i < b.length; i++) res |= view.getUint8(i) ^ b[i];
    return res === 0;
  }

  return false;
};
