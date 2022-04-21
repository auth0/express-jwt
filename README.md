# express-jwt

This module provides Express middleware for validating JWTs ([JSON Web Tokens](https://jwt.io)) through the [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken/) module. The decoded JWT payload is available on the request object.

## Install

```
$ npm install express-jwt
```

## Usage

Basic usage using an HS256 secret:

```javascript
var { expressjwt: jwt } = require("express-jwt");
// or ES6
// import { expressjwt, ExpressJwtRequest } from "express-jwt";

app.get(
  "/protected",
  jwt({ secret: "shhhhhhared-secret", algorithms: ["HS256"] }),
  function (req, res) {
    if (!req.auth.admin) return res.sendStatus(401);
    res.sendStatus(200);
  }
);
```

The decoded JWT payload is available on the request via the `auth` property.

> The default behavior of the module is to extract the JWT from the `Authorization` header as an [OAuth2 Bearer token](https://oauth.net/2/bearer-tokens/).

### Required Parameters

The `algorithms` parameter is required to prevent potential downgrade attacks when providing third party libraries as **secrets**.

:warning: **Do not mix symmetric and asymmetric (ie HS256/RS256) algorithms**: Mixing algorithms without further validation can potentially result in downgrade vulnerabilities.

```javascript
jwt({
  secret: "shhhhhhared-secret",
  algorithms: ["HS256"],
  //algorithms: ['RS256']
});
```

### Additional Options

You can specify audience and/or issuer as well, which is highly recommended for security purposes:

```javascript
jwt({
  secret: "shhhhhhared-secret",
  audience: "http://myapi/protected",
  issuer: "http://issuer",
  algorithms: ["HS256"],
});
```

> If the JWT has an expiration (`exp`), it will be checked.

If you are using a base64 URL-encoded secret, pass a `Buffer` with `base64` encoding as the secret instead of a string:

```javascript
jwt({
  secret: Buffer.from("shhhhhhared-secret", "base64"),
  algorithms: ["RS256"],
});
```

To only protect specific paths (e.g. beginning with `/api`), use [express router](https://expressjs.com/en/4x/api.html#app.use) call `use`, like so:

```javascript
app.use("/api", jwt({ secret: "shhhhhhared-secret", algorithms: ["HS256"] }));
```

Or, the other way around, if you want to make some paths unprotected, cal `unless` like so.

```javascript
app.use(
  jwt({
    secret: "shhhhhhared-secret",
    algorithms: ["HS256"],
  }).unless({ path: ["/token"] })
);
```

This is especially useful when applying to multiple routes. In the example above, `path` can be a string, a regexp, or an array of any of those.

> For more details on the `.unless` syntax including additional options, please see [express-unless](https://github.com/jfromaniello/express-unless).

This module also support tokens signed with public/private key pairs. Instead of a secret, you can specify a Buffer with the public key

```javascript
var publicKey = fs.readFileSync("/path/to/public.pub");
jwt({ secret: publicKey, algorithms: ["RS256"] });
```

### Customizing Token Location

A custom function for extracting the token from a request can be specified with
the `getToken` option. This is useful if you need to pass the token through a
query parameter or a cookie. You can throw an error in this function and it will
be handled by `express-jwt`.

```javascript
app.use(
  jwt({
    secret: "hello world !",
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    },
  })
);
```

### Retrieve key dynamically

If you need to obtain the key dynamically from other sources, you can pass a function in the `secret` parameter with the following parameters:

- `req` (`Object`) - The express `request` object.
- `token` (`Object`) - An object with the JWT payload and headers.

For example, if the secret varies based on the [issuer](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#issDef):

```javascript
var jwt = require("express-jwt");
var data = require("./data");
var utilities = require("./utilities");

var getSecret = async function (req, token) {
  const issuer = token.payload.iss;
  const tenant = await data.getTenantByIdentifier(issuer);
  if (!tenant) {
    throw new Error("missing_secret");
  }
  return utilities.decrypt(tenant.secret);
};

app.get(
  "/protected",
  jwt({ secret: getSecret, algorithms: ["HS256"] }),
  function (req, res) {
    if (!req.auth.admin) return res.sendStatus(401);
    res.sendStatus(200);
  }
);
```

### Revoked tokens

It is possible that some tokens will need to be revoked so they cannot be used any longer. You can provide a function as the `isRevoked` option. The signature of the function is `function(req, payload, done)`:

- `req` (`Object`) - The express `request` object.
- `token` (`Object`) - An object with the JWT payload and headers.

For example, if the `(iss, jti)` claim pair is used to identify a JWT:

```javascript
const jwt = require("express-jwt");
const data = require("./data");

const isRevokedCallback = async (req, token) => {
  const issuer = token.payload.iss;
  const tokenId = token.payload.jti;
  const token = await data.getRevokedToken(issuer, tokenId);
  return token !== "undefined";
};

app.get(
  "/protected",
  jwt({
    secret: "shhhhhhared-secret",
    algorithms: ["HS256"],
    isRevoked: isRevokedCallback,
  }),
  function (req, res) {
    if (!req.auth.admin) return res.sendStatus(401);
    res.sendStatus(200);
  }
);
```

### Error handling

The default behavior is to throw an error when the token is invalid, so you can add your custom logic to manage unauthorized access as follows:

```javascript
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token...");
  } else {
    next(err);
  }
});
```

You might want to use this module to identify registered users while still providing access to unregistered users. You can do this by using the option `credentialsRequired`:

```javascript
app.use(
  jwt({
    secret: "hello world !",
    algorithms: ["HS256"],
    credentialsRequired: false,
  })
);
```

## Typescript

An `ExpressJwtRequest` type is provided which extends `express.Request` with the `auth` property.

```typescript
import { expressjwt, ExpressJwtRequest } from "express-jwt";

app.get(
  "/protected",
  expressjwt({ secret: "shhhhhhared-secret", algorithms: ["HS256"] }),
  function (req: ExpressJwtRequest, res: express.Response) {
    if (!req.auth.admin) return res.sendStatus(401);
    res.sendStatus(200);
  }
);
```

## Related Modules

- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JSON Web Token sign and verification
- [express-jwt-permissions](https://github.com/MichielDeMey/express-jwt-permissions) - Permissions middleware for JWT tokens

## Tests

```
$ npm install
$ npm test
```

## Contributors

Check them out [here](https://github.com/auth0/express-jwt/graphs/contributors)

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
