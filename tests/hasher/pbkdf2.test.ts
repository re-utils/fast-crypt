import pbkdf2 from 'fast-crypt/web/hasher/pbkdf2';

import { test, expect, describe } from 'bun:test';

describe('PBKDF2 hasher', () => {
  test('Hash & Verify', async () => {
    const MSG = 'hello';

    {
      const [hash, verify] = pbkdf2();
      const hashed = await hash(MSG);

      const [hash1, verify1] = pbkdf2();
      const hashed1 = await hash1(MSG);

      console.log(hashed);

      expect(await verify(hashed, MSG)).toBe(true);
      expect(await verify(hashed1, MSG)).toBe(true);
      expect(await verify1(hashed, MSG)).toBe(true);
      expect(await verify1(hashed1, MSG)).toBe(true);
    }
  });
});
