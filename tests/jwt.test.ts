import { test, expect, describe } from 'bun:test';

import webJwt from 'fast-crypt/web/jwt';

describe('JWT', () => {
  test('Sign & Verify', async () => {
    const KEY = crypto.randomUUID();
    const DAT = { msg: 'hello' };

    {
      const [sign, verify] = await webJwt(KEY);
      const signed = await sign(DAT);
      expect(await verify(signed)).toEqual(DAT);
    }
  });
});
