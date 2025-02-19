import pbkdf2 from 'fast-crypt/web/hasher/pbkdf2';

import { test, expect, describe } from 'bun:test';

describe('PBKDF2 hasher', () => {
  test('Hash & Verify', async () => {
    const MSG = 'hello';

    {
      const [hash, verify] = pbkdf2();
      const hashed = await hash(MSG);
      expect(await verify(hashed, MSG)).toBe(true);
    }
  });
});
