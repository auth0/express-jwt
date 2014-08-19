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

You can specify audience and/or issuer as well:

    jwt({ secret: 'shhhhhhared-secret',
          audience: 'http://myapi/protected',
          issuer: 'http://issuer' })

> If the JWT has an expiration (`exp`), it will be checked.

Optionally you can add paths for the middleware to skip:

    app.use(jwt({ secret: 'shhhhhhared-secret'}).unless({path: ['/token']}));

This is especially useful when applying to multiple routes.

This module also support tokens signed with public/private key pairs. Instead of a secret, you can specify a Buffer with the public key

    var publicKey = fs.readFileSync('/pat/to/public.pub');
    jwt({ secret: publicKey });


You can also use a custom callback to generate the **req.user**, if you want to use it to store the data in a different location and read if from another. If you want to read if from redis for example

```javascript
var client = require('redis').createClient();
var jwt = require("express-jwt");

jwt({
    secret: 'shhhhhhared-secret'
    jwtverify: function (decoded, callback) {

        var id = decoded._id;
        
        client.get(id, function (err, reply) {
            if (err) {
                return done(err, {
                    "msg": err
                });
            }

            if (_.isNull(reply)) {
                return done(new Error("token_invalid"), {
                    "msg": "Token doesn't exists, are you sure it hasn't expired or been revoked?"
                });
            } else {
                var data = JSON.parse(reply);

                if (_.isEqual(data._id, id)) {
                    return done(null, data);
                } else {
                    return done(new Error("token_doesnt_exist"), {
                        "msg": "Token doesn't exists, login into the system so it can generate new token."
                    });
                }

            }

    }
});
```

This will allow you to store the token in a redis server and keep it small, and fetch the data from the redis store, this way we can have big data stored in redis, and only keep the id in the token generation.

So if we generate the token with only **{ id: id }**, the rest of the data we store in redis, now we can fetch it on checking, also this will store the token in the system so if you delete the token from redis, the token will be invalidated automatically.

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
