class ExpressError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;

// module.exports = ExpressError;

//this is used to create custom error messages for the server to send back to the client with the appropriate status code and message.and it can be used in any part of the application where a custom error needs to be thrown.
