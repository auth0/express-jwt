# express-jwt

[![Build](https://travis-ci.org/auth0/express-jwt.png)](http://travis-ci.org/auth0/express-jwt)

Middleware that validates JsonWebTokens and sets `req.user`.

This module lets you authenticate HTTP requests using JWT tokens in your Node.js
applications.  JWTs are typically used protect API endpoints, and are
often issued using OpenID Connect.

## Install

    $ npm install express-jwt

## Usage

The JWT authentication middleware authenticates callers using a JWT.
If the token is valid, `req.user` will be set with the JSON object decoded
to be used by later middleware for authorization and access control.

For example,

```javascript
var jwt = require('express-jwt');

app.get('/protected',
  jwt({secret: 'shhhhhhared-secret'}),
  function(req, res) {
    if (!req.user.admin) return res.send(401);
    res.send(200);
  });
```

You can specify audience and/or issuer as well:

```javascript
jwt({ secret: 'shhhhhhared-secret',
  audience: 'http://myapi/protected',
  issuer: 'http://issuer' })
```

> If the JWT has an expiration (`exp`), it will be checked.

Optionally you can make some paths unprotected as follows:

```javascript
app.use(jwt({ secret: 'shhhhhhared-secret'}).unless({path: ['/token']}));
```

This is especially useful when applying to multiple routes.

This module also support tokens signed with public/private key pairs. Instead of a secret, you can specify a Buffer with the public key

```javascript
var publicKey = fs.readFileSync('/pat/to/public.pub');
jwt({ secret: publicKey });
```

By default, the decoded token is attached to `req.user` but can be configured with the `userProperty` option.

```javascript
jwt({ secret: publicKey, userProperty: 'auth' });
```


### Error handling

The default behavior is to throw an error when the token is invalid, so you can add your custom logic to manage unauthorized access as follows:


```javascript
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.send(401, 'invalid token...');
  }
});
```

You might want to use this module to identify registered users without preventing unregistered clients to access to some data, you
can do it using the option _credentialsRequired_:

    app.use(jwt({ 
      secret: 'hello world !',
      credentialsRequired: false
    }));

## Related Modules

- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JSON Web Token sign and verification

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Tests

    $ npm install
    $ npm test

## Credits

- @jfromaniello ([20 contributions](https://github.com/auth0/express-jwt/commits?author=jfromaniello))
- @woloski ([16 contributions](https://github.com/auth0/express-jwt/commits?author=woloski))
- @aaronogle ([3 contributions](https://github.com/auth0/express-jwt/commits?author=aaronogle))
- @mck- ([3 contributions](https://github.com/auth0/express-jwt/commits?author=mck-))
- @CLevasseur ([2 contributions](https://github.com/auth0/express-jwt/commits?author=CLevasseur))
- @wiherek5 ([1 contributions](https://github.com/auth0/express-jwt/commits?author=wiherek5))
- @davis ([1 contributions](https://github.com/auth0/express-jwt/commits?author=davis))
- @godeatgod ([1 contributions](https://github.com/auth0/express-jwt/commits?author=godeatgod))
- @nkcmr ([1 contributions](https://github.com/auth0/express-jwt/commits?author=nkcmr))
- @philosoralphter ([1 contributions](https://github.com/auth0/express-jwt/commits?author=philosoralphter))
- @iamsebastian ([1 contributions](https://github.com/auth0/express-jwt/commits?author=iamsebastian))
- @tonytamps ([1 contributions](https://github.com/auth0/express-jwt/commits?author=tonytamps))
- @dannyrscott ([1 contributions](https://github.com/auth0/express-jwt/commits?author=dannyrscott))
- @dschenkelman ([1 contributions](https://github.com/auth0/express-jwt/commits?author=dschenkelman))

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Auth0 <[http://auth0.com](http://auth0.com)>
