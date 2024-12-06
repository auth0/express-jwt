import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { unless } from 'express-unless';
import { set } from './util/set';

import { UnauthorizedError } from './errors/UnauthorizedError';

/**
 * A function that defines how to retrieve the verification key given the express request and the JWT.
 */
export type GetVerificationKey = (req: express.Request, token: jwt.Jwt | undefined) => jwt.Secret | undefined | Promise<jwt.Secret | undefined>;

/**
 * @deprecated use GetVerificationKey
 */
export type SecretCallback = GetVerificationKey;

/**
 * @deprecated use GetVerificationKey
 */
export type SecretCallbackLong = GetVerificationKey;

/**
 * A function to check if a token is revoked
 */
export type IsRevoked = (req: express.Request, token: jwt.Jwt | undefined) => boolean | Promise<boolean>;

/**
 * A function to check if a token is revoked
 */
export type ExpirationHandler = (req: express.Request, err: UnauthorizedError) => void | Promise<void>;

/**
 * A function to customize how a token is retrieved from the express request.
 */
export type TokenGetter = (req: express.Request) => string | Promise<string> | undefined;

export type Params = {
  /**
   * The Key or a function to retrieve the key used to verify the JWT.
   */
  secret: jwt.Secret | GetVerificationKey,

  /**
   * Defines how to retrieves the token from the request object.
   */
  getToken?: TokenGetter,

  /**
   * Defines how to verify if a token is revoked.
   */
  isRevoked?: IsRevoked,

  /**
   * If sets to true, continue to the next middleware when the
   * request doesn't include a token without failing.
   *
   * @default true
   */
  credentialsRequired?: boolean,

  /**
   * Allows to customize the name of the property in the request object
   * where the decoded payload is set.
   * @default 'auth'
   */
  requestProperty?: string,

  /**
   * List of JWT algorithms allowed.
   */
  algorithms: jwt.Algorithm[],

  /**
   * Handle expired tokens.
   */
  onExpired?: ExpirationHandler,
} & jwt.VerifyOptions;

export { UnauthorizedError } from './errors/UnauthorizedError';

/**
 * @deprecated this breaks tsc when using strict: true
 */
export type ExpressJwtRequest<T = jwt.JwtPayload> =
  express.Request & { auth: T }

/**
 * @deprecated use Request<T>
 */
export type ExpressJwtRequestUnrequired<T = jwt.JwtPayload> =
  express.Request & { auth?: T }

/**
 * The Express Request including the "auth" property with the decoded JWT payload.
 */
export type Request<T = jwt.JwtPayload> =
  express.Request & { auth?: T };

/**
 * Returns an express middleware to verify JWTs.
 *
 * @param options {Params}
 * @returns
 */
export const expressjwt = (options: Params) => {
  if (!options?.secret) throw new RangeError('express-jwt: `secret` is a required option');
  if (!options.algorithms) throw new RangeError('express-jwt: `algorithms` is a required option');
  if (!Array.isArray(options.algorithms)) throw new RangeError('express-jwt: `algorithms` must be an array');

  const getVerificationKey: GetVerificationKey =
    typeof options.secret === 'function' ?
      options.secret :
      async () => options.secret as jwt.Secret;

  const credentialsRequired = typeof options.credentialsRequired === 'undefined' ? true : options.credentialsRequired;
  const requestProperty = typeof options.requestProperty === 'string' ? options.requestProperty : 'auth';

  const middleware = async function (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    let token: string;
    try {
      if (req.method === 'OPTIONS' && 'access-control-request-headers' in req.headers) {
        const hasAuthInAccessControl = req.headers['access-control-request-headers']
          .split(',')
          .map(header => header.trim().toLowerCase())
          .includes('authorization');
        if (hasAuthInAccessControl) {
          setImmediate(next);
          return;
        }
      }

      const authorizationHeader = req.headers && 'Authorization' in req.headers ? 'Authorization' : 'authorization';
      if (options.getToken && typeof options.getToken === 'function') {
        token = await options.getToken(req);
      } else if (req.headers && req.headers[authorizationHeader]) {
        const parts = (req.headers[authorizationHeader] as string).split(' ');
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
        await jwt.verify(token, key, options);
      } catch (err) {
        const wrappedErr = new UnauthorizedError('invalid_token', err);
        if (err instanceof jwt.TokenExpiredError && typeof options.onExpired === 'function') {
          await options.onExpired(req, wrappedErr);
        } else {
          throw wrappedErr;
        }
      }

      const isRevoked = options.isRevoked && await options.isRevoked(req, decodedToken) || false;
      if (isRevoked) {
        throw new UnauthorizedError('revoked_token', { message: 'The token has been revoked.' });
      }

      const request = req as Request<jwt.JwtPayload | string>;
      set(request, requestProperty, decodedToken.payload);
      setImmediate(next);
    } catch (err) {
      setImmediate(next, err);
    }
  };

  middleware.unless = unless;

  return middleware;
}


