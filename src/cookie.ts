export const pair = (name: string, value: string): string => name + '=' + value;

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
