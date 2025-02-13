# `ucrypt`
Fast crypto library for all runtimes.

## `ucrypt/web`
Crypto utilities implemented with WebCrypto.

## JWT
```ts
import jwt from 'ucrypt/web/jwt';

// Optional interface for typings
interface Info {
  name: string
}

// Default algorithm is HS256
const [signJWT, verifyJWT] = jwt<Info>('secret', 'HS256');

// In request handler
{
  // Sign a token
  const token = await signJWT({ name: 'Reve' });

  // Get a token payload
  const payload = await verifyJWT(token);

  // Handle error
  if (typeof payload === 'symbol') {
    // Error name in symbol description
    switch (payload.description) {
      case 'invalid': // Malformed token
      case 'nbf': // Does not match 'nbf' header
      case 'exp': // Does not match 'exp' header
      case 'iat': // Does not match 'iat' header
      case 'mismatch': // Invalid token
    }
  }

  payload.name; // Reve
}
```
