import jwt, { decode as decodeJwt } from 'jsonwebtoken';
import { InternalServerError } from '../../error/index.js';
import { logger } from '../../log/index.js';

export interface JwtToken<T> {
  data: T;
  iat: number;
  exp: number;
}

interface JwtConfig {
  secret: string;
  expiration: string;
  sessionExpiration: string;
}

interface JwtSignOptions<T = any> {
  payload: T;
  addBearer?: boolean;
  extendedExpiration?: boolean;
}

const BEARER: string = 'Bearer ';

let expiration: string;
let secret: string;
let sessionExpiration: string;

function configure(config: JwtConfig): void {
  secret = config.secret;
  expiration = config.expiration;
  sessionExpiration = config.sessionExpiration;
}

function decode<T>(token: string): JwtToken<T> | null {
  checkConfig();

  try {
    const splitToken = token.replace(BEARER, '');
    return decodeJwt(splitToken) as JwtToken<T>;
  } catch (err) {
    logger.debug('Invalid JWT token (verify): ', err.message);
    return null;
  }
}

function verify<T>(token: string, secretOrPublicKey?: string | Buffer): JwtToken<T> | null {
  checkConfig();

  try {
    const splitToken = token.replace(BEARER, '');
    return jwt.verify(splitToken, secretOrPublicKey ? secretOrPublicKey : secret) as JwtToken<T>;
  } catch (err) {
    logger.debug('Invalid JWT token (verify): ', err.message);
    return null;
  }
}

function sign<T>({ payload, addBearer = true, extendedExpiration = false }: JwtSignOptions<T>): string {
  checkConfig();

  let signedToken = jwt.sign({ data: payload }, secret, {
    expiresIn: extendedExpiration ? `${sessionExpiration}d` : expiration,
  });

  if (addBearer) {
    signedToken = BEARER + signedToken;
  }

  return signedToken;
}

function checkConfig() {
  if (!logger || !expiration || !secret || !sessionExpiration) {
    throw new InternalServerError({ details: 'JWT configuration is not set' });
  }
}

export const JwtService = { configure, decode, verify, sign };
