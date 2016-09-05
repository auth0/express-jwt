function UnauthorizedError (code, error, opts) {
  Error.call(this, error.message);
  if(opts.stack) Error.captureStackTrace(this, this.constructor)
  this.name = "UnauthorizedError";
  this.message = error.message;
  this.code = code;
  this.status = 401;
  this.inner = error;
}

UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;

module.exports = UnauthorizedError;
