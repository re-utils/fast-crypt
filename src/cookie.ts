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
export const key = (
  name: string,
  options: string
): [
  encode: (value: string | number) => string,
  decode: (value: string) => string | undefined
] => {
  // Pre-encode the key
  name = encodeURIComponent(name) + '=';
  const nameLen = name.length;

  return [
    (val) => name + val + options,
    (cookie) => {
      let idx = cookie.indexOf(name);
      if (idx !== -1) {
        idx += nameLen;
        const endIdx = cookie.indexOf(';', idx);
        return endIdx === -1 ? cookie.slice(idx) : cookie.substring(idx, endIdx)
      }
    },
  ];
};
