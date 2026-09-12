import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';

describe('README', function () {
  it('should not recommend the deprecated ExpressJwtRequest type', function () {
    const readme = fs.readFileSync(path.join(process.cwd(), 'README.md'), 'utf8');
    assert.equal(
      /import\s*\{[^}]*\bExpressJwtRequest\b[^}]*\}\s*from\s*["']express-jwt["']/.test(readme),
      false
    );
  });
});
