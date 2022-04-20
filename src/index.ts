import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import expressUnless from 'express-unless';
import { UnauthorizedError } from './errors/UnauthorizedError';

export type GetVerificationKey = (req: express.Request, token: jwt.Jwt | undefined) => Promise<jwt.Secret>;
export type IsRevoked = (req: express.Request, token: jwt.Jwt | undefined) => Promise<boolean>;

type TokenGetter = (req: express.Request) => string | Promise<string> | undefined;

type Params = {
  secret: jwt.Secret | GetVerificationKey,
  getToken?: TokenGetter,
  isRevoked?: IsRevoked,
  credentialsRequired?: boolean,
} & jwt.VerifyOptions;

export { UnauthorizedError } from './errors/UnauthorizedError';

export type ExpressJwtRequest<T = jwt.JwtPayload> =
  express.Request & { auth: T }


export const expressjwt = (options: Params) => {
  if (!options?.secret) throw new RangeError('express-jwt: `secret` is a required option');
  if (!options.algorithms) throw new RangeError('express-jwt: `algorithms` is a required option');
  if (!Array.isArray(options.algorithms)) throw new RangeError('express-jwt: `algorithms` must be an array');

  const getVerificationKey: GetVerificationKey =
    typeof options.secret === 'function' ?
      options.secret :
      async () => options.secret as jwt.Secret;

  const credentialsRequired = typeof options.credentialsRequired === 'undefined' ? true : options.credentialsRequired;


  const middleware = async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    let token: string;
    try {
      if (req.method === 'OPTIONS' && 'access-control-request-headers' in req.headers) {
        const hasAuthInAccessControl = req.headers['access-control-request-headers']
          .split(',')
          .map(header => header.trim())
          .includes('authorization');
        if (hasAuthInAccessControl) {
          return next();
        }
      }

      if (options.getToken && typeof options.getToken === 'function') {
        token = await options.getToken(req);
      } else if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
          const scheme = parts[0];
          const credentials = parts[1];

          if (/^Bearer$/i.test(scheme)) {
            token = credentials;
          } else {
            if (credentialsRequired) {
              throw new UnauthorizedError('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' });
            } else {
              return next();
            }
          }
        } else {
          throw new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' });
        }
      }

      if (!token) {
        if (credentialsRequired) {
          throw new UnauthorizedError('credentials_required', { message: 'No authorization token was found' });
        } else {
          return next();
        }
      }

      let decodedToken: jwt.Jwt;

      try {
        decodedToken = jwt.decode(token, { complete: true });
      } catch (err) {
        throw new UnauthorizedError('invalid_token', err);
      }

      const key = await getVerificationKey(req, decodedToken);

      try {
        jwt.verify(token, key, options);
      } catch (err) {
        throw new UnauthorizedError('invalid_token', err);
      }

      const isRevoked = options.isRevoked && await options.isRevoked(req, decodedToken) || false;
      if (isRevoked) {
        throw new UnauthorizedError('revoked_token', { message: 'The token has been revoked.' });
      }

      const request = req as ExpressJwtRequest<jwt.JwtPayload | string>;
      request.auth = decodedToken.payload;
      next();
    } catch (err) {
      return next(err);
    }
  };

  middleware.unless = expressUnless;

  return middleware;
}


