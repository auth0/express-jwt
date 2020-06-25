var jwt = require('jsonwebtoken');
var assert = require('assert');

var expressjwt = require('../lib');
var UnauthorizedError = require('../lib/errors/UnauthorizedError');

describe('string tokens', function () {
  var req = {};
  var res = {};

  it('should work with a valid string token', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign('foo', secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret, algorithms: ['HS256']})(req, res, function() {
      assert.equal('foo', req.user);
    });
  });

});