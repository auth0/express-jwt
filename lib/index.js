var jwt = require('jsonwebtoken');
var UnauthorizedError = require('./errors/UnauthorizedError');
var unless = require('express-unless');
var async = require('async');
var set = require('lodash.set');

var DEFAULT_REVOKED_FUNCTION = function(_, __, cb) { return cb(null, false); };

function isFunction(object) {
  return Object.prototype.toString.call(object) === '[object Function]';
}

function wrapStaticSecretInCallback(secret){
  return function(_, __, cb){
    return cb(null, secret);
  };
}

module.exports = function(options) {
  if (!options || !options.secret) throw new Error('secret should be set');

  var secretCallback = options.secret;

  if (!isFunction(secretCallback)){
    secretCallback = wrapStaticSecretInCallback(secretCallback);
  }

  var isRevokedCallback = options.isRevoked || DEFAULT_REVOKED_FUNCTION;

  var _requestProperty = options.userProperty || options.requestProperty || 'user';
  var _responseProperty = options.requestProperty || options.resultProperty || 'locals.user';
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
        } else {
          if (credentialsRequired) {
            return next(new UnauthorizedError('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' }));
          } else {
            return next();
          }
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

    var dtoken;

    try {
      dtoken = jwt.decode(token, { complete: true }) || {};
    } catch (err) {
      return next(new UnauthorizedError('invalid_token', err));
    }

    async.waterfall([
      function getSecret(callback){
        var arity = secretCallback.length;
        if (arity == 4) {
          secretCallback(req, dtoken.header, dtoken.payload, callback);
        } else { // arity == 3
          secretCallback(req, dtoken.payload, callback);
        }
      },
      function verifyToken(secret, callback) {
        jwt.verify(token, secret, options, function(err, decoded) {
          if (err) {
            callback(new UnauthorizedError('invalid_token', err));
          } else {
            callback(null, decoded);
          }
        });
      },
      function checkRevoked(decoded, callback) {
        isRevokedCallback(req, dtoken.payload, function (err, revoked) {
          if (err) {
            callback(err);
          }
          else if (revoked) {
            callback(new UnauthorizedError('revoked_token', {message: 'The token has been revoked.'}));
          } else {
            callback(null, decoded);
          }
        });
      }

    ], function (err, result){
      if (err) { return next(err); }
      if (_responseProperty) {
        set(res, _responseProperty, result);
      } else {
        set(req, _requestProperty, result);
      }
      next();
    });
  };

  middleware.unless = unless;
  middleware.UnauthorizedError = UnauthorizedError;

  return middleware;
};

module.exports.UnauthorizedError = UnauthorizedError;
