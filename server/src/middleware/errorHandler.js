export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong.';

  if (error.name === 'CastError') {
    statusCode = 404;
    message = 'The requested item was not found.';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = error.keyPattern?.email
      ? 'An account with that email already exists.'
      : 'A record with these details already exists.';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(' ');
  }

  if (process.env.NODE_ENV !== 'production') console.error(error);
  res.status(statusCode).json({ message });
}
