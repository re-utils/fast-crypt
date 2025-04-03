A low-level fast crypto library for all runtimes.

# Cookie
Set and extract cookie values.
```ts
import * as cookie from 'fast-crypt/cookie';

// Pre-calculate `${encodeURIComponent(key)}=` and static options
const [extractId, setId] = cookie.key(
  'id',
  // Static options
  cookie.sameSiteLax + cookie.secure,
  // Integer parser
  cookie.t_int,
);

// Set cookie in a request handler
(c) => {
  c.headers.push([
    'Set-Cookie',
    // Dynamically set cookie options
    setId(userId) + cookie.maxAge(7200 * (isAuthor ? 5 : 1))
  ]);
};

// Parse cookie in a request handler
(c) => {
  const cookie = c.req.headers.get('Cookie');
  if (cookie !== null) {
    const userId = extractId(cookie); // number | undefined
    if (userId != null) {
      // Do something with the value
    }

    // Extract other cookies...
  }
};

{
  // Custom value parser
  const parser: cookie.Parser<number> = [
    // Encoder
    (val) => '' + val,
    // Decoder
    (str) => +str
  ];

  const [extract, set] = cookie.key(
    'id', '', parser
  );
}
```

If you are setting a value with `cookie.t_string` parser that can contain [lone surrogates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#exceptions), you
should validate the string with `str.isWellFormed()` to avoid throwing errors.
```ts
if (str.isWellFormed()) {
  // No lone surrogates found
  const cookieValue = setId(userId);
}
```

This check is opt-out as in a lot of cases you can ensure that the value does not contain these characters (like encrypted values).

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

# Hashers
Hashing messages.

## PBKDF2
Hash passwords with WebCrypto API:
```ts
import pbkdf2 from 'fast-crypt/web/hasher/pbkdf2';

const [hash, verify] = pbkdf2({
  salt?: number, // The salt length to generate
  iterations?: number, // Default to 1e5
  hash?: string, // Default to SHA-256
});

const pwd = 'admin';
const hashed = await hash(pwd);
await verify(hashed, pwd) === true;
```
