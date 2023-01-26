/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { expressjwt, UnauthorizedError, Request, GetVerificationKey } from '../src';
import * as assert from 'assert';


describe('failure tests', function () {
  const req = {} as express.Request;
  const res = {} as express.Response;

  it('should throw if options not sent', function () {
    try {
      // @ts-ignore
      expressjwt();
    } catch (e) {
      assert.ok(e);
      assert.equal(e.message, "express-jwt: `secret` is a required option");
    }
  });

  it('should throw if algorithms is not sent', function () {
    try {
      // @ts-ignore
      expressjwt({ secret: 'shhhh' });
    } catch (e) {
      assert.ok(e);
      assert.equal(e.message, 'express-jwt: `algorithms` is a required option');
    }
  });

  it('should throw if algorithms is not an array', function () {
    try {
      // @ts-ignore
      expressjwt({ secret: 'shhhh', algorithms: 'foo' });
    } catch (e) {
      assert.ok(e);
      assert.equal(e.message, 'express-jwt: `algorithms` must be an array');
    }
  });

  it('should throw if no authorization header and credentials are required', function (done) {
    expressjwt({ secret: 'shhhh', credentialsRequired: true, algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'credentials_required');
      done();
    });
  });

  it('support unless skip', function (done) {
    req.originalUrl = '/index.html';
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'] }).unless({ path: '/index.html' })(req, res, function (err) {
      assert.ok(!err);
      done();
    });
  });

  it('should skip on CORS preflight', function (done) {
    const corsReq = {} as express.Request;
    corsReq.method = 'OPTIONS';
    corsReq.headers = {
      'access-control-request-headers': 'sasa, sras,  authorization'
    };
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'] })(corsReq, res, function (err) {
      assert.ok(!err);
      done();
    });
  });

  it('should throw if authorization header is malformed', function (done) {
    req.headers = {};
    req.headers.authorization = 'wrong';
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'credentials_bad_format');
      done();
    });
  });

  it('should throw if authorization header is not Bearer', function () {
    req.headers = {};
    req.headers.authorization = 'Basic foobar';
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'credentials_bad_scheme');
    });
  });

  it('should next if authorization header is not Bearer and credentialsRequired is false', function (done) {
    req.headers = {};
    req.headers.authorization = 'Basic foobar';
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'], credentialsRequired: false })(req, res, function (err) {
      assert.ok(typeof err === 'undefined');
      done();
    });
  });

  it('should throw if authorization header is not well-formatted jwt', function (done) {
    req.headers = {};
    req.headers.authorization = 'Bearer wrongjwt';
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      done();
    });
  });

  it('should throw if jwt is an invalid json', function (done) {
    req.headers = {};
    req.headers.authorization = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yJ1c2VybmFtZSI6InNhZ3VpYXIiLCJpYXQiOjE0NzEwMTg2MzUsImV4cCI6MTQ3MzYxMDYzNX0.foo';
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      done();
    });
  });

  it('should throw if authorization header is not valid jwt', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar' }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: 'different-shhhh', algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'invalid signature');
      done()
    });
  });

  it('should throw if audience is not expected', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar', aud: 'expected-audience' }, secret, { expiresIn: 500 });

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: 'shhhhhh', algorithms: ['HS256'], audience: 'not-expected-audience' })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'jwt audience invalid. expected: not-expected-audience');
      done();
    });
  });

  it('should throw if token is expired', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar', exp: 1382412921 }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: 'shhhhhh', algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.inner.name, 'TokenExpiredError');
      assert.equal(err.message, 'jwt expired');
      done();
    });
  });

  it('should not throw if token is expired but the expired handler let it thru', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar', exp: 1382412921 }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({
      secret: 'shhhhhh',
      algorithms: ['HS256'],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onExpired: () => { },
    })(req, res, function (err) {
      assert.ok(!err);
      //@ts-ignore
      assert.equal(req.auth.foo, 'bar');
      done();
    });
  });

  it('should throw if token is expired and the expired handler rethrows it', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar', exp: 1382412921 }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({
      secret: 'shhhhhh',
      algorithms: ['HS256'],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onExpired: (req, err) => { throw err; },
    })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.inner.name, 'TokenExpiredError');
      assert.equal(err.message, 'jwt expired');
      done();
    });
  });

  it('should throw if token issuer is wrong', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar', iss: 'http://foo' }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: 'shhhhhh', algorithms: ['HS256'], issuer: 'http://wrong' })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'jwt issuer invalid. expected: http://wrong');
      done();
    });
  });

  it('should use errors thrown from custom getToken function', function (done) {
    expressjwt({
      secret: 'shhhhhh', algorithms: ['HS256'],
      getToken: () => { throw new UnauthorizedError('invalid_token', { message: 'Invalid token!' }); }
    })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'Invalid token!');
      done();
    });
  });

  it('should throw error when signature is wrong', function (done) {
    const secret = "shhh";
    const token = jwt.sign({ foo: 'bar', iss: 'http://www' }, secret);
    // manipulate the token
    const newContent = Buffer.from("{foo: 'bar', edg: 'ar'}").toString('base64');
    const splitetToken = token.split(".");
    splitetToken[1] = newContent;
    const newToken = splitetToken.join(".");
    // build request
    // @ts-ignore
    req.headers = [];
    req.headers.authorization = 'Bearer ' + newToken;
    expressjwt({ secret: secret, algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'invalid token');
      done();
    });
  });

  it('should throw error if token is expired even with when credentials are not required', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar', exp: 1382412921 }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: secret, credentialsRequired: false, algorithms: ['HS256'] })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'jwt expired');
      done();
    });
  });

  it('should throw error if token is invalid even with when credentials are not required', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar', exp: 1382412921 }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: "not the secret", algorithms: ['HS256'], credentialsRequired: false })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'invalid_token');
      assert.equal(err.message, 'invalid signature');
      done();
    });
  });

});

describe('work tests', function () {
  // var req = {} as express.Request;
  // var res = {} as express.Response;

  it('should work if authorization header is valid jwt', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar' }, secret);
    const req = {} as Request;
    const res = {} as express.Response;
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: secret, algorithms: ['HS256'] })(req, res, function () {
      assert.equal(req.auth?.foo, 'bar');
      done();
    });
  });

  it('should work with custom and nested request property', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar' }, secret);
    const req = {} as Request;
    const res = {} as express.Response;
    const requestProperty = 'auth.payload';

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: secret, algorithms: ['HS256'], requestProperty })(req, res, function () {
      assert.equal(req.auth?.payload.foo, 'bar');
      done();
    });
  });

  it('should work if authorization header is valid with a buffer secret', function (done) {
    const secret = Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');
    const token = jwt.sign({ foo: 'bar' }, secret);
    const req = {} as Request;
    const res = {} as express.Response;

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: secret, algorithms: ['HS256'] })(req, res, function () {
      assert.equal(req.auth?.foo, 'bar');
      done();
    });
  });

  it('should work if Authorization header is capitalized (lambda environment)', function (done) {
    const secret = Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');
    const token = jwt.sign({ foo: 'bar' }, secret);
    const req = {} as Request;
    const res = {} as express.Response;

    req.headers = {};
    req.headers.Authorization = 'Bearer ' + token;
    expressjwt({ secret: secret, algorithms: ['HS256'] })(req, res, function (err) {
      if (err) { return done(err); }
      assert.equal(req.auth?.foo, 'bar');
      done();
    });
  });

  it('should work if no authorization header and credentials are not required', function (done) {
    const req = {} as express.Request;
    const res = {} as express.Response;
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'], credentialsRequired: false })(req, res, done);
  });

  it('should not work if no authorization header', function (done) {
    const req = {} as express.Request;
    const res = {} as express.Response;
    expressjwt({ secret: 'shhhh', algorithms: ['HS256'] })(req, res, function (err) {
      assert(typeof err !== 'undefined');
      done();
    });
  });

  it('should produce a stack trace that includes the failure reason', function (done) {
    const req = {} as express.Request;
    const res = {} as express.Response;
    const token = jwt.sign({ foo: 'bar' }, 'secretA');
    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;

    expressjwt({ secret: 'secretB', algorithms: ['HS256'] })(req, res, function (err) {
      const index = err.stack.indexOf('UnauthorizedError: invalid signature')
      assert.equal(index, 0, "Stack trace didn't include 'invalid signature' message.")
      done();
    });

  });

  it('should work with a custom getToken function', function (done) {
    const req = {} as Request;
    const res = {} as express.Response;
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar' }, secret);

    req.headers = {};
    req.query = {};
    req.query.token = token;

    function getTokenFromQuery(req) {
      return req.query.token;
    }

    expressjwt({
      secret: secret,
      algorithms: ['HS256'],
      getToken: getTokenFromQuery
    })(req, res, function () {
      assert.equal(req.auth?.foo, 'bar');
      done();
    });
  });

  it('should work with an async getToken function', function (done) {
    const req = {} as Request;
    const res = {} as express.Response;
    const secret = 'shhhhhh';
    const token = jwt.sign({ foo: 'bar' }, secret);

    req.headers = {};
    req.query = {};
    req.query.token = token;

    function getTokenFromQuery(req) {
      return Promise.resolve(req.query.token);
    }

    expressjwt({
      secret: secret,
      algorithms: ['HS256'],
      getToken: getTokenFromQuery
    })(req, res, function () {
      assert.equal(req.auth?.foo, 'bar');
      done();
    });
  });

  it('should work with a secretCallback function that accepts header argument', function (done) {
    const req = {} as Request;
    const res = {} as express.Response;
    const secret = 'shhhhhh';
    const getSecret: GetVerificationKey = async (req, token) => {
      // @ts-ignore
      assert.equal(token.header.alg, 'HS256');
      // @ts-ignore
      assert.equal(token.payload.foo, 'bar');
      return secret;
    };

    const token = jwt.sign({ foo: 'bar' }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({ secret: getSecret, algorithms: ['HS256'] })(req, res, function () {
      assert.equal(req.auth?.foo, 'bar');
      done();
    });
  });
});
