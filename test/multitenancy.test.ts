import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { expressjwt, ExpressJwtRequest, GetVerificationKey } from '../src';
import assert from 'assert';

describe('multitenancy', function () {
  const req = {} as ExpressJwtRequest;
  const res = {} as express.Response;

  const tenants = {
    'a': {
      secret: 'secret-a'
    }
  };

  const secretCallback: GetVerificationKey = function (req, token) {
    const issuer = (token.payload as jwt.JwtPayload).iss;
    if (tenants[issuer]) {
      return tenants[issuer].secret;
    }
    throw new Error('Could not find secret for issuer.');
  };

  const middleware = expressjwt({
    secret: secretCallback,
    algorithms: ['HS256']
  });

  it('should retrieve secret using callback', function (done) {
    const token = jwt.sign({ foo: 'bar' }, tenants.a.secret, { issuer: 'a' });

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;

    middleware(req, res, function () {
      assert.equal(req.auth.foo, 'bar');
      done();
    });
  });

  it('should throw if an error ocurred when retrieving the token', function (done) {
    const secret = 'shhhhhh';
    const token = jwt.sign({ iss: 'inexistent', foo: 'bar' }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;

    middleware(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.message, 'Could not find secret for issuer.');
      done();
    });
  });

  it('should fail if token is revoked', function (done) {
    const token = jwt.sign({ iss: 'a', foo: 'bar' }, tenants.a.secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;

    expressjwt({
      secret: secretCallback,
      algorithms: ['HS256'],
      isRevoked: async () => true
    })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'revoked_token');
      assert.equal(err.message, 'The token has been revoked.');
      done();
    });
  });
});

