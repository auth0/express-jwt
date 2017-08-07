var jwt = require('jsonwebtoken');
var assert = require('assert');

var expressjwt = require('../lib');
var UnauthorizedError = require('../lib/errors/UnauthorizedError');

describe('failure tests', function () {
  var req = {};
  var res = {};

  it('should throw if options not sent', function() {
    try {
      expressjwt();
    } catch(e) {
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

  it('support unless skip', function() {
    req.originalUrl = '/index.html';
    expressjwt({secret: 'shhhh'}).unless({path: '/index.html'})(req, res, function(err) {
      assert.ok(!err);
    });
  });

  it('should skip on CORS preflight', function() {
    var corsReq = {};
    corsReq.method = 'OPTIONS';
    corsReq.headers = {
      'access-control-request-headers': 'sasa, sras,  authorization'
    };
    expressjwt({secret: 'shhhh'})(corsReq, res, function(err) {
      assert.ok(!err);
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

  it('should throw if authorization header is not Bearer', function() {
    req.headers = {};
    req.headers.authorization = 'Basic foobar';
    expressjwt({secret: 'shhhh'})(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'credentials_bad_scheme');
    });
  });

  it('should next if authorization header is not Bearer and credentialsRequired is false', function() {
    req.headers = {};
    req.headers.authorization = 'Basic foobar';
    expressjwt({secret: 'shhhh', credentialsRequired: false})(req, res, function(err) {
      assert.ok(typeof err === 'undefined');
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

  it('should throw if jwt is an invalid json', function() {
    req.headers = {};
    req.headers.authorization = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yJ1c2VybmFtZSI6InNhZ3VpYXIiLCJpYXQiOjE0NzEwMTg2MzUsImV4cCI6MTQ3MzYxMDYzNX0.foo';
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
      assert.equal(err.message, 'jwt audience invalid. expected: not-expected-audience');
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
      assert.equal(err.inner.name, 'TokenExpiredError');
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
      assert.equal(err.message, 'jwt issuer invalid. expected: http://wrong');
    });
  });

  it('should use errors thrown from custom getToken function', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    function getTokenThatThrowsError() {
      throw new UnauthorizedError('invalid_token', { message: 'Invalid token!' });
    }

    expressjwt({
      secret: 'shhhhhh',
      getToken: getTokenThatThrowsError
    })(req, res, function(err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'Invalid token!');
    });
  });


  it('should throw error when signature is wrong', function() {
      var secret = "shhh";
      var token = jwt.sign({foo: 'bar', iss: 'http://www'}, secret);
      // manipulate the token
      var newContent = new Buffer("{foo: 'bar', edg: 'ar'}").toString('base64');
      var splitetToken = token.split(".");
      splitetToken[1] = newContent;
      var newToken = splitetToken.join(".");

      // build request
      req.headers = [];
      req.headers.authorization = 'Bearer ' + newToken;
      expressjwt({secret: secret})(req,res, function(err) {
          assert.ok(err);
          assert.equal(err.code, 'invalid_token');
          assert.equal(err.message, 'invalid token');
      });
  });

  it('should throw error if token is expired even with when credentials are not required', function() {
      var secret = 'shhhhhh';
      var token = jwt.sign({foo: 'bar', exp: 1382412921}, secret);

      req.headers = {};
      req.headers.authorization = 'Bearer ' + token;
      expressjwt({ secret: secret, credentialsRequired: false })(req, res, function(err) {
          assert.ok(err);
          assert.equal(err.code, 'invalid_token');
          assert.equal(err.message, 'jwt expired');
      });
  });

  it('should throw error if token is invalid even with when credentials are not required', function() {
      var secret = 'shhhhhh';
      var token = jwt.sign({foo: 'bar', exp: 1382412921}, secret);

      req.headers = {};
      req.headers.authorization = 'Bearer ' + token;
      expressjwt({ secret: "not the secret", credentialsRequired: false })(req, res, function(err) {
          assert.ok(err);
          assert.equal(err.code, 'invalid_token');
          assert.equal(err.message, 'invalid signature');
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

  it('should work with nested properties', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret, requestProperty: 'auth.token'})(req, res, function() {
      assert.equal('bar', req.auth.token.foo);
    });
  });

  it('should work if authorization header is valid with a buffer secret', function() {
    var secret = new Buffer('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');
    var token = jwt.sign({foo: 'bar'}, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret})(req, res, function() {
      assert.equal('bar', req.user.foo);
    });
  });

  it('should set userProperty if option provided', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret, userProperty: 'auth'})(req, res, function() {
      assert.equal('bar', req.auth.foo);
    });
  });

  it('should set responseProperty if option provided', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    req = { };
    res = { };
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret, responseProperty: 'locals.user'})(req, res, function() {
      assert.equal('bar', res.locals.user.foo);
      assert.ok(typeof req.user === 'undefined');
    });
  });
  
  it('should set responseProperty if resultProperty (deprecated) option provided', function () {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    req = { };
    res = { };
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret, resultProperty: 'locals.user'})(req, res, function() {
      assert.equal('bar', res.locals.user.foo);
      assert.ok(typeof req.user === 'undefined');
    });
  });

  it('should ignore userProperty if responseProperty option provided', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    req = { };
    res = { };
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret, userProperty: 'auth', responseProperty: 'locals.user'})(req, res, function() {
      assert.equal('bar', res.locals.user.foo);
      assert.ok(typeof req.auth === 'undefined');
    });
  });

  it('should work if no authorization header and credentials are not required', function() {
    req = {};
    expressjwt({ secret: 'shhhh', credentialsRequired: false })(req, res, function(err) {
      assert(typeof err === 'undefined');
    });
  });

  it('should not work if no authorization header', function() {
    req = {};
    expressjwt({ secret: 'shhhh' })(req, res, function(err) {
      assert(typeof err !== 'undefined');
    });
  });

  it('should produce a stack trace that includes the failure reason', function() {
    var req = {};
    var token = jwt.sign({foo: 'bar'}, 'secretA');
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;

    expressjwt({secret: 'secretB'})(req, res, function(err) {
      var index = err.stack.indexOf('UnauthorizedError: invalid signature')
      assert.equal(index, 0, "Stack trace didn't include 'invalid signature' message.")
    });

  });

  it('should work with a custom getToken function', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    req.headers = {};
    req.query = {};
    req.query.token = token;

    function getTokenFromQuery(req) {
      return req.query.token;
    }

    expressjwt({
      secret: secret,
      getToken: getTokenFromQuery
    })(req, res, function() {
      assert.equal('bar', req.user.foo);
    });
  });

  it('should work with a secretCallback function that accepts header argument', function() {
    var secret = 'shhhhhh';
    var secretCallback = function(req, headers, payload, cb) {
      assert.equal(headers.alg, 'HS256');
      assert.equal(payload.foo, 'bar');
      process.nextTick(function(){ return cb(null, secret) });
    }
    var token = jwt.sign({foo: 'bar'}, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secretCallback})(req, res, function() {
      assert.equal('bar', req.user.foo);
    });
  });
});
