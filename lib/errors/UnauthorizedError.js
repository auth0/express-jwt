function UnauthorizedError (res, code, error) {
  res.setHeader('WWW-Authenticate', 'Bearer token_type="JWT"');
  Error.call(this, error.message);
  this.name = "UnauthorizedError";
  this.message = error.message;
  this.code = code;
  this.status = 401;
  this.inner = error;
}

UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;

module.exports = UnauthorizedError;
