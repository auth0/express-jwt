import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { expressjwt, ExpressJwtRequest } from '../src';
import assert from 'assert';

describe('revoked jwts', function () {
  const secret = 'shhhhhh';

  const revoked_id = '1234'

  const middleware = expressjwt({
    secret: secret,
    algorithms: ['HS256'],
    isRevoked: async (req, token) => {
      const isRevoked = typeof token.payload !== 'string' &&
        token.payload.jti === revoked_id;
      return isRevoked;
    }
  });

  it('should throw if token is revoked', function () {
    const req = {} as ExpressJwtRequest;
    const res = {} as express.Response;

    const token = jwt.sign({ jti: revoked_id, foo: 'bar' }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;

    middleware(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.code, 'revoked_token');
      assert.equal(err.message, 'The token has been revoked.');
    });
  });

  it('should work if token is not revoked', function () {
    const req = {} as ExpressJwtRequest;
    const res = {} as express.Response;

    const token = jwt.sign({ jti: '1233', foo: 'bar' }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;

    middleware(req, res, function () {
      assert.equal(req.auth.foo, 'bar');
    });
  });

  it('should throw if error occurs checking if token is revoked', function (done) {
    const req = {} as ExpressJwtRequest;
    const res = {} as express.Response;

    const token = jwt.sign({ jti: revoked_id, foo: 'bar' }, secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;

    expressjwt({
      secret: secret,
      algorithms: ['HS256'],
      isRevoked: async () => {
        throw new Error('An error ocurred');
      }
    })(req, res, function (err) {
      assert.ok(err);
      assert.equal(err.message, 'An error ocurred');
      done();
    });
  });
});
