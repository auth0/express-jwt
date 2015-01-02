var jwt = require('jsonwebtoken');
var UnauthorizedError = require('./errors/UnauthorizedError');
var unless = require('express-unless');

module.exports = function(options) {
  if (!options || !options.secret) throw new Error('secret should be set');

  var _userProperty = options.userProperty || 'user';
  var middleware = function(req, res, next) {
    var token;

    if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
      var hasAuthInAccessControl = !!~req.headers['access-control-request-headers']
                                    .split(',').map(function (header) {
                                      return header.trim();
                                    }).indexOf('authorization');

      if (hasAuthInAccessControl) {
        return next();
      }
    }

    if (typeof options.skip !== 'undefined') {
      console.warn('WARN: express-jwt: options.skip is deprecated');
      console.warn('WARN: use app.use(jwt(options).unless({path: \'/x\'}))');
      if (options.skip.indexOf(req.url) > -1) {
        return next();
      }
    }

    if (options.getToken && typeof options.getToken === 'function') {
      try {
        token = options.getToken(req);
      } catch (e) {
        return next(e);
      }
    } else if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0];
        var credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        return next(new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' }));
      }
    }

    if (!token) {
      if (options.credentialsRequired) {
        return next(new UnauthorizedError('credentials_required', { message: 'No authorization token was found' }));
      } else {
        return next();
      }
    }

    jwt.verify(token, options.secret, options, function(err, decoded) {
      if (err) return next(new UnauthorizedError('invalid_token', err));

      req[_userProperty] = decoded;
      next();
    });
  };

  middleware.unless = unless;

  return middleware;
};
