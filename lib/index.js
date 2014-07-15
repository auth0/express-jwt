var jwt = require('jsonwebtoken');
var UnauthorizedError = require('./errors/UnauthorizedError');

module.exports = function(options) {
  if (!options || !options.secret) throw new Error('secret should be set');

  return function(req, res, next) {
    var token;
    
    if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
	for (var ctrlReqs = req.headers['access-control-request-headers'].split(','),i=0;
	     i < ctrlReqs.length; i++) {
	    if (ctrlReqs[i].indexOf('authorization') != -1) 
		return next();
	}
    }
    
    if (typeof options.skip !== 'undefined' && options.skip instanceof Array) {
      for(var j = 0; j < options.skip.length; j++) {
        if(options.skip[j] instanceof RegExp) {
          if(req.url.match(options.skip[j])) {
            return next();
          }
        }
        else if(options.skip[j] === req.url) {
          return next();
        }
      }
    }
    
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

    jwt.verify(token, options.secret, options, function(err, decoded) {
      if (err) return next(new UnauthorizedError('invalid_token', err));

      req.user = decoded;
      next();
    });
  };
};
