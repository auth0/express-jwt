import { UnauthorizedError } from '../src/errors/UnauthorizedError';
import * as assert from 'assert';

describe('Unauthorized Error', () => {
  const e = new UnauthorizedError('credentials_bad_format', new Error('a'));

  it('should be an instance of UnauthorizedError', () => {
    assert.ok(e instanceof UnauthorizedError);
  });

  it('should contains the error code', () => {
    assert.ok(e.code, 'credentials_bad_format');
  });

  it('should contains the error message', () => {
    assert.ok(e.code, 'a');
  });
});

