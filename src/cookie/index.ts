export type Fn = (value: string) => string | undefined;

export type CookieKey = [
  /**
   * Get this key value from the input cookie
   */
  extract: Fn,

  /**
   * Return a cookie pair.
   * For abitrary strings, you should check with `str.isWellFormed()` before passing to set
   */
  value: (value: string | number) => string
];

// Encode and decode without throwing errors
export const safeDecode: Fn = (val) => {
  try {
    return decodeURIComponent(val);
  } catch { }
};

export default (name: string, suffix: string = '; HttpOnly'): CookieKey => {
  // Pre-encode the key
  name = encodeURIComponent(name) + '=';
  const nameLen = name.length;

  return [
    (cookie) => {
      const idx = cookie.indexOf(name) + nameLen;
      if (idx !== nameLen - 1) {
        const endIdx = cookie.indexOf(';', idx);
        return safeDecode(endIdx === -1 ? cookie.slice(idx) : cookie.substring(idx, endIdx));
      }
    },
    (val) => name + (typeof val === 'string' ? encodeURIComponent(val) : val) + suffix
  ];
};
