import { } from 'express';

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details in non‑production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  const errorResponse = {
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  };

  res.status(status).json(errorResponse);
};

export default errorHandler;
