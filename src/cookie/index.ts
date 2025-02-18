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

export interface CookieOptions {
  secure?: boolean;
  httpOnly?: boolean;
  partitioned?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  path?: string;
  domain?: string;
}

// Encode and decode without throwing errors
export const safeDecode: Fn = (val) => {
  try {
    return decodeURIComponent(val);
  } catch { }
};

export default (name: string, options?: CookieOptions): CookieKey => {
  // Pre-encode the key
  name = encodeURIComponent(name) + '=';
  const nameLen = name.length;

  // Pre-calculate options
  let opts = '; HttpOnly';
  if (options != null) {
    // Unset httpOnly when forced to
    if (options.httpOnly === false)
      opts = '';
    if (options.secure === true)
      opts += '; Secure';
    if (options.partitioned === true)
      opts += '; Partitioned';

    if (options.sameSite != null)
      opts += '; SameSite=' + options.sameSite;
    if (options.maxAge != null)
      opts += '; Max-Age=' + options.maxAge;
    if (options.path != null)
      opts += '; Path=' + options.path;
    if (options.domain != null)
      opts += '; Domain=' + options.path;
  }

  return [
    (cookie) => {
      const idx = cookie.indexOf(name) + nameLen;
      if (idx !== nameLen - 1) {
        const endIdx = cookie.indexOf(';', idx);
        return safeDecode(endIdx === -1 ? cookie.slice(idx) : cookie.substring(idx, endIdx));
      }
    },

    opts.length === 0
      ? (val) => name + (typeof val === 'string' ? encodeURIComponent(val) : val)
      : (val) => name + (typeof val === 'string' ? encodeURIComponent(val) : val) + opts
  ];
};
