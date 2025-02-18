# `fast-crypt`
Fast crypto library for all runtimes.

# JWT
You should read [this link](https://gist.github.com/samsch/0d1f3d3b4745d778f78b230cf6061452)
before consider using JWTs.

```ts
import jwt from 'fast-crypt/web/jwt';

// Optional interface for typings
interface Info {
  name: string
}

// Default algorithm is HS256
const [sign, verify] = await jwt<Info>('secret', 'HS256');

// In request handler
{
  // Sign a token
  const token = await sign({ name: 'Reve' });

  // Get a token payload
  const payload = await verify(token);

  // Handle error
  if (typeof payload === 'symbol') {
    // Error name in symbol description
    switch (payload.description) {
      case 'invalid': // Malformed token
      case 'nbf': // Does not match 'nbf' header
      case 'exp': // Does not match 'exp' header
      case 'mismatch': // Invalid token
    }
  }

  payload.name; // Reve
}
```

# Signers
Message signers for signing values like cookies.

## HMAC

WebCrypto based APIs:
```ts
import hmac from 'fast-crypt/web/signer/hmac';

// Default hash algorithm is SHA-256
const [sign, verify] = await hmac('mysecret', 'SHA-256');

{
  // Sign a message
  const signedValue = await sign('Hi');

  // Verify a signed message
  const value = await verify(signedValue); // 'Hi'

  // Invalid message
  if (value == null) {
    // Handle errors...
  }
}
```

`node:crypto` based APIs:
```ts
import hmac from 'fast-crypt/node/signer/hmac';
import { verifier } from 'fast-crypt/node/signer';

// Default hash algorithm is sha256
const [sign, verify] = hmac('mysecret', 'sha256');

{
  // Sign a message
  const signedValue = sign('Hi');

  // Verify a signed message
  const value = verify(signedValue); // 'Hi'

  // Invalid message
  if (value == null) {
    // Handle errors...
  }
}
```
