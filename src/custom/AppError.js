class AppError extends Error {
  constructor(errorCode, message, statusCode, delay) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.delay = delay;
  }
}

module.exports = AppError;
