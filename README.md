# express-jwt

[![Build](https://travis-ci.org/auth0/express-jwt.png)](http://travis-ci.org/auth0/express-jwt)

Middleware that validates JsonWebTokens and set `req.user`.

This module lets you authenticate HTTP requests using JWT tokens, in your Node.js
applications.  JWT tokens are typically used protect API endpoints, and are
often issued using OpenID Connect.

## Install

    $ npm install express-jwt

## Usage

The JWT authentication middleware authenticates callers using a JWT
token.  If the token is valid, `req.user` will be set with the JSON object decoded to be used by later middleware for authorization and access control.

For example,

    var jwt = require('express-jwt');

    app.get('/protected',
      jwt({secret: 'shhhhhhared-secret'}),
      function(req, res) {
        if (!req.user.admin) return res.send(401);
        res.send(200);
      });

You can specify audience and/or issuer as well

    jwt({ secret: 'shhhhhhared-secret',
          audience: 'http://myapi/protected',
          issuer: 'http://issuer' })

> If the JWT has an expiration (`exp`), it will be checked.

The `secureUrlPrefix` option will only apply the middleware to paths that begin with the prefix.

    app.use(jwt({ secret: 'shhhhhhared-secret', secureUrlPrefix: '/api'}));

Optionally you can add paths for the middleware to skip

    app.use(jwt({ secret: 'shhhhhhared-secret', skip: ['/token']}));

This is especially useful when applying to multiple routes.

This module also support tokens signed with public/private key pairs. Instead of a secret, you can specify a Buffer with the public key

    var publicKey = fs.readFileSync('/pat/to/public.pub');
    jwt({ secret: publicKey });

## Related Modules

- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JSON Web Token sign and verification

## Tests

    $ npm install
    $ npm test

## Credits

  - [Matias Woloski](http://github.com/woloski)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Auth0 <[http://auth0.com](http://auth0.com)>
