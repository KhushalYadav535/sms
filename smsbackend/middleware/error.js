const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal server error',
    statusCode: err.statusCode || 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message),
      statusCode: 400
    };
  }

  if (err.code === 'ER_DUP_ENTRY') {
    error = {
      message: 'Duplicate entry',
      statusCode: 400
    };
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    error = {
      message: 'Referenced record does not exist',
      statusCode: 400
    };
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 