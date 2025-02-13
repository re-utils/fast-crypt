# `fast-crypt`
Fast crypto library for all runtimes.

## `fast-crypt/web`
Crypto utilities implemented with WebCrypto.

## JWT
Consider reading [this link](https://gist.github.com/samsch/0d1f3d3b4745d778f78b230cf6061452)
before you consider using JWTs.

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

## Signer
Value signer for signing cookies.

### HMAC
```ts
import hmac from 'fast-crypt/web/signer/hmac';

// Default hash algorithm is SHA-256
const [sign, verify] = await hmac('mysecret', 'SHA-256');

{
  // Sign a value
  const signedValue = await sign('Reve');

  // Verify a signed value
  const value = await verify(signedValue); // 'Reve'

  // Invalid value
  if (value === null) {
    // Handle errors...
  }
}
```
