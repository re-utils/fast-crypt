export const encodeBase64Url = (str: string): string => Buffer.from(str).toString('base64url');
export const decodeBase64Url = (str: string): string => Buffer.from(str, 'base64url').toString();
