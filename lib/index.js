var jwt = require('jsonwebtoken');
var UnauthorizedError = require('./errors/UnauthorizedError');

module.exports = function(options) {
  if (!options || !options.secret) throw new Error('secret should be set');

  return function(req, res, next) {
    var token;
    if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0]
          , credentials = parts[1];
          
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        return next(new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' }));
      }
    } else {
      return next(new UnauthorizedError('credentials_required', { message: 'No Authorization header was found' }));
    }

    jwt.verify(token, options.secret, function(err, decoded) {
      if (err) return next(new UnauthorizedError('invalid_token', err));

      req.user = decoded;
      next();
    });
  };
};