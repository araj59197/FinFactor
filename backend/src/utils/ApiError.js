class ApiError extends Error {

  constructor(statusCode, message, name = 'ApiError') {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

module.exports = {
  ApiError,
};


