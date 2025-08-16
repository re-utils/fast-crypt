import { expect, test } from 'bun:test';
import * as scrypt from '../src/scrypt.ts';

test('Basic signer', async () => {
  const sign = scrypt.signer();
  const hash = await sign('Hi');

  expect(hash, 'Hashing failed').toBeTypeOf('string');
  expect(
    await scrypt.verify('Hi', hash as string),
    'Hash verification failed',
  ).toBeTrue();
});
