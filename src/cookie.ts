export type Parser<T = unknown> = [
  encode: (value: T) => string,
  decode: (value: string) => T | undefined,
];

export interface Options<T> {
  options: string;
  parser: Parser<T>;
}

// Cookie options
export const path = (str: string): string => '; Path=' + str;
export const domain = (str: string): string => '; Domain=' + str;
export const expires = (date: Date): string =>
  '; Expires=' + date.toUTCString();
export const maxAge = (age: number): string => '; Max-Age=' + age;

export const httpOnly = '; HttpOnly';
export const partitioned = '; Partitioned';
export const secure = '; Secure';

export const sameSiteLax = '; SameSite=Lax';
export const sameSiteStrict = '; SameSite=Strict';

// Must include secure for same site none
export const sameSiteNone = '; SameSite=None; Secure';

// Create a key encoder and decoder
export const key = <T extends Parser>(
  name: string,
  options: string,
  [encode, decode]: T,
): T => {
  // Pre-encode the key
  name = encodeURIComponent(name) + '=';
  const nameLen = name.length;

  return [
    (val) => name + encode(val) + options,
    (cookie) => {
      let idx = cookie.indexOf(name);
      if (idx !== -1) {
        idx += nameLen;
        const endIdx = cookie.indexOf(';', idx);
        return decode(
          endIdx === -1 ? cookie.slice(idx) : cookie.substring(idx, endIdx),
        );
      }
    },
  ] as T;
};

export const noopEncoder = (val: any): any => val;

// Key parser
// eslint-disable-next-line
export const t_string: Parser<string> = [
  encodeURIComponent,
  (str) => {
    try {
      return decodeURIComponent(str);
    } catch {}
  },
];

// eslint-disable-next-line
export const t_float: Parser<number> = [
  noopEncoder,
  (str) => {
    const val = +str;
    if (Number.isFinite(val)) return val;
  },
];

// eslint-disable-next-line
export const t_int: Parser<number> = [
  noopEncoder,
  (str) => {
    const val = +str;
    if (Number.isInteger(val)) return val;
  },
];
