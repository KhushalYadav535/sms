const { body, validationResult } = require('express-validator');

exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Auth validations
exports.loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Member validations
exports.memberValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  body('address')
    .optional()
    .trim()
];

// Notice validations
exports.noticeValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('type')
    .isIn(['notice', 'event', 'maintenance'])
    .withMessage('Invalid notice type'),
  body('priority')
    .isIn(['low', 'normal', 'high'])
    .withMessage('Invalid priority level'),
  body('start_date')
    .isDate()
    .withMessage('Invalid start date'),
  body('end_date')
    .isDate()
    .withMessage('Invalid end date')
];

// Complaint validations
exports.complaintValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('priority')
    .isIn(['low', 'normal', 'high'])
    .withMessage('Invalid priority level')
];

// Accounting validations
exports.accountingValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Invalid transaction type'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('date')
    .isDate()
    .withMessage('Invalid date')
];

// Profile update validations
exports.profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
];

// Password change validations
exports.passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
]; 