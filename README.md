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

## Tests

    $ npm install
    $ npm test

## Credits

  - [Matias Woloski](http://github.com/woloski)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Auth0 <[http://auth0.com](http://auth0.com)>
