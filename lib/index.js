var jwt = require('jsonwebtoken');
var UnauthorizedError = require('./errors/UnauthorizedError');
var unless = require('express-unless');
var async = require('async');

var DEFAULT_REVOKED_FUNCTION = function(_, __, cb) { return cb(null, false); }

function wrapStaticSecretInCallback(secret){
  return function(_, __, cb){
    return cb(null, secret);
  };
}

module.exports = function(options) {
  if (!options || !options.secret) throw new Error('secret should be set');

  var secretCallback = options.secret;

  if (typeof secretCallback === 'string'){
    secretCallback = wrapStaticSecretInCallback(secretCallback);
  }

  var isRevokedCallback = options.isRevoked || DEFAULT_REVOKED_FUNCTION;

  var _requestProperty = options.userProperty || options.requestProperty || 'user';
  var credentialsRequired = typeof options.credentialsRequired === 'undefined' ? true : options.credentialsRequired;

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
      if (credentialsRequired) {
        return next(new UnauthorizedError('credentials_required', { message: 'No authorization token was found' }));
      } else {
        return next();
      }
    }

    var payload = jwt.decode(token, { json: true });

    async.parallel([
      function(callback){
        secretCallback(req, payload, callback);
      },
      function(callback){
        isRevokedCallback(req, payload, callback);
      }
    ], function(err, results){
      if (err) { return next(err); }
      var revoked = results[1];
      if (revoked){
        return next(new UnauthorizedError('revoked_token', { message: 'The token has been revoked.'}));
      }

      var secret = results[0];

      jwt.verify(token, secret, options, function(err, decoded) {
        if (err && credentialsRequired) return next(new UnauthorizedError('invalid_token', err));

        req[_requestProperty] = decoded;
        next();
      });
    });
  };

  middleware.unless = unless;

  return middleware;
};
