# express-jwt

[![Build](https://travis-ci.org/auth0/express-jwt.png)](http://travis-ci.org/auth0/express-jwt)

This module provides Express middleware for validating JWTs ([JSON Web Tokens](https://jwt.io)) through the [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken/) module. The decoded JWT payload is available on the request object.

## Install

```
$ npm install express-jwt
```

## Usage

Basic usage using an HS256 secret:

```javascript
var jwt = require('express-jwt');

app.get('/protected',
  jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] }),
  function(req, res) {
    if (!req.user.admin) return res.sendStatus(401);
    res.sendStatus(200);
  });
```

The decoded JWT payload is available on the request via the `user` property. This can be configured using the `requestProperty` option ([see below](#retrieving-the-decoded-payload)).

> The default behavior of the module is to extract the JWT from the `Authorization` header as an [OAuth2 Bearer token](https://oauth.net/2/bearer-tokens/).

### Required Parameters
The `algorithms` parameter is required to prevent potential downgrade attacks when providing third party libraries as **secrets**.

:warning: **Do not mix symmetric and asymmetric (ie HS256/RS256) algorithms**: Mixing algorithms without further validation can potentially result in downgrade vulnerabilities.

```javascript
jwt({
  secret: 'shhhhhhared-secret',
  algorithms: ['HS256']
  //algorithms: ['RS256']
})
```

### Additional Options

You can specify audience and/or issuer as well, which is highly recommended for security purposes:

```javascript
jwt({
  secret: 'shhhhhhared-secret',
  audience: 'http://myapi/protected',
  issuer: 'http://issuer',
  algorithms: ['HS256']
})
```

> If the JWT has an expiration (`exp`), it will be checked.

If you are using a base64 URL-encoded secret, pass a `Buffer` with `base64` encoding as the secret instead of a string:

```javascript
jwt({ secret: Buffer.from('shhhhhhared-secret', 'base64'),
      algorithms: ['RS256'] })
```

Optionally you can make some paths unprotected as follows:

```javascript
app.use(jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256']}).unless({path: ['/token']}));
```

This is especially useful when applying to multiple routes. In the example above, `path` can be a string, a regexp, or an array of any of those.

> For more details on the `.unless` syntax including additional options, please see [express-unless](https://github.com/jfromaniello/express-unless).

This module also support tokens signed with public/private key pairs. Instead of a secret, you can specify a Buffer with the public key

```javascript
var publicKey = fs.readFileSync('/path/to/public.pub');
jwt({ secret: publicKey, algorithms: ['RS256'] });
```

### Retrieving the Decoded Payload

By default, the decoded token is attached to `req.user` but can be configured with the `requestProperty` option.


```javascript
jwt({ secret: publicKey, algorithms: ['RS256'], requestProperty: 'auth' });
```

The token can also be attached to the `result` object with the `resultProperty` option. This option will override any `requestProperty`.

```javascript
jwt({ secret: publicKey, algorithms: ['RS256'], resultProperty: 'locals.user' });
```

Both `resultProperty` and `requestProperty` utilize [lodash.set](https://lodash.com/docs/4.17.2#set) and will accept nested property paths.

### Customizing Token Location

A custom function for extracting the token from a request can be specified with
the `getToken` option. This is useful if you need to pass the token through a
query parameter or a cookie. You can throw an error in this function and it will
be handled by `express-jwt`.

```javascript
app.use(jwt({
  secret: 'hello world !',
  algorithms: ['HS256'],
  credentialsRequired: false,
  getToken: function fromHeaderOrQuerystring (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
}));
```

Alternatively, you can provide a callback function as the `getToken` parameter. This is useful if you need to do any asynchronous action to return the JWT.
The function has the signature: `function(req, done)`:
* `req` (`Object`) - The express `request` object.
* `done` (`Function`) - A function with signature `function(err, token)` to be invoked when the token is retrieved.
  * `err` (`Any`) - The error that occurred.
  * `token` (`String`) - The JWT.

For example, if you use a nested JWS into a JWE, it will allow you to decrypt the JWE (thanks to jose library) first. Then, you can extract the JWS token from the JWE payload.
```javascript
var secret = 'shhh';
app.use(jwt({
  secret: 'hello world !',
  algorithms: ['HS256'],
  getToken: function fromJWEClaimAttribute(req, done) {
    jwtDecrypt(req.headers.authorization.split(' ')[1], Buffer.from(secret))
            .then((payload, protectedHeader) => {
              done(null, payload.claim);
            }).catch((err) => {
              done(err);
            });
  }
}));
```

### Multi-tenancy

If you are developing an application in which the secret used to sign tokens is not static, you can provide a callback function as the `secret` parameter. The function has the signature: `function(req, payload, done)`:
* `req` (`Object`) - The express `request` object.
* `payload` (`Object`) - An object with the JWT claims.
* `done` (`Function`) - A function with signature `function(err, secret)` to be invoked when the secret is retrieved.
  * `err` (`Any`) - The error that occurred.
  * `secret` (`String`) - The secret to use to verify the JWT.

For example, if the secret varies based on the [JWT issuer](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#issDef):

```javascript
var jwt = require('express-jwt');
var data = require('./data');
var utilities = require('./utilities');

var secretCallback = function(req, payload, done){
  var issuer = payload.iss;

  data.getTenantByIdentifier(issuer, function(err, tenant){
    if (err) { return done(err); }
    if (!tenant) { return done(new Error('missing_secret')); }

    var secret = utilities.decrypt(tenant.secret);
    done(null, secret);
  });
};

app.get('/protected',
  jwt({ secret: secretCallback, algorithms: ['HS256'] }),
  function(req, res) {
    if (!req.user.admin) return res.sendStatus(401);
    res.sendStatus(200);
  });
```

### Revoked tokens
It is possible that some tokens will need to be revoked so they cannot be used any longer. You can provide a function as the `isRevoked` option. The signature of the function is `function(req, payload, done)`:
* `req` (`Object`) - The express `request` object.
* `payload` (`Object`) - An object with the JWT claims.
* `done` (`Function`) - A function with signature `function(err, revoked)` to be invoked once the check to see if the token is revoked or not is complete.
  * `err` (`Any`) - The error that occurred.
  * `revoked` (`Boolean`) - `true` if the JWT is revoked, `false` otherwise.

For example, if the `(iss, jti)` claim pair is used to identify a JWT:
```javascript
var jwt = require('express-jwt');
var data = require('./data');
var utilities = require('./utilities');

var isRevokedCallback = function(req, payload, done){
  var issuer = payload.iss;
  var tokenId = payload.jti;

  data.getRevokedToken(issuer, tokenId, function(err, token){
    if (err) { return done(err); }
    return done(null, !!token);
  });
};

app.get('/protected',
  jwt({
    secret: 'shhhhhhared-secret',
    algorithms: ['HS256'],
    isRevoked: isRevokedCallback
  }),
  function(req, res) {
    if (!req.user.admin) return res.sendStatus(401);
    res.sendStatus(200);
  }
);
```

### Error handling

The default behavior is to throw an error when the token is invalid, so you can add your custom logic to manage unauthorized access as follows:

```javascript
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});
```

You might want to use this module to identify registered users while still providing access to unregistered users. You can do this by using the option `credentialsRequired`:

```javascript
app.use(jwt({
  secret: 'hello world !',
  algorithms: ['HS256'],
  credentialsRequired: false
}));
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

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
