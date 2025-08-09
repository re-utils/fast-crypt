import { expect, test } from 'bun:test';
import * as st from '@safe-std/error';
import * as scrypt from '../src/scrypt.ts';

test('Basic signer', async () => {
  const sign = scrypt.signer();
  const hash = await sign('Hi');

  expect(st.isErr(hash), 'Hashing failed').toBeFalse();
  expect(
    await scrypt.verify('Hi', hash as string),
    'Hash verification failed',
  ).toBeTrue();
});
