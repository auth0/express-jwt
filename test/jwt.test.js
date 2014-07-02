var jwt = require('jsonwebtoken');
var assert = require('assert');

var expressjwt = require('../lib');

describe('failure tests', function () {
  var req = {};
  var res = {};

  it('should throw if options not sent', function() {
    try {
      expressjwt();
    }
    catch(e) {
      assert.ok(e);
      assert.equal(e.message, 'secret should be set');
    }
  });

  it('should throw if no authorization header and credentials are required', function() {
    expressjwt({secret: 'shhhh', credentialsRequired: true})(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'credentials_required');
    });
  });

  it('should throw if authorization header is malformed', function() {
    req.headers = {};
    req.headers.authorization = 'wrong';
    expressjwt({secret: 'shhhh'})(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'credentials_bad_format');
    });
  });

  it('should throw if authorization header is not well-formatted jwt', function() {
    req.headers = {};
    req.headers.authorization = 'Bearer wrongjwt';
    expressjwt({secret: 'shhhh'})(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
    });
  });

  it('should throw if authorization header is not valid jwt', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);
    
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: 'different-shhhh'})(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'invalid signature');
    });
  });

  it('should throw if audience is not expected', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar', aud: 'expected-audience'}, secret);
    
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: 'shhhhhh', audience: 'not-expected-audience'})(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'jwt audience invalid. expected: expected-audience');
    });
  });

  it('should throw if token is expired', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar', exp: 1382412921 }, secret);
    
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: 'shhhhhh'})(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'jwt expired');
    });
  });

  it('should throw if token issuer is wrong', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar', iss: 'http://foo' }, secret);
    
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: 'shhhhhh', issuer: 'http://wrong'})(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'jwt issuer invalid. expected: http://foo');
    });
  });


});

describe('work tests', function () {
  var req = {};
  var res = {};

  it('should work if authorization header is valid jwt', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);
    
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret})(req, res, function() {
      assert.equal('bar', req.user.foo);
    });
  });

  it('should work if no authorization header and credentials are not required', function() {
    req = {};
    expressjwt({secret: 'shhhh', credentialsRequired: false})(req, res, function(err) {
      assert(typeof err === 'undefined');
    });
  });

});
