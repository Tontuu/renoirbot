class CanceledError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CanceledError';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

module.exports = {
  CanceledError,
  NotFoundError,
};