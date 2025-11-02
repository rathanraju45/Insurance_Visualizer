const { body, validationResult } = require('express-validator');

const customerRules = [
  body('full_name').exists().withMessage('full_name is required').bail().isString().trim().notEmpty(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('invalid email'),
  body('date_of_birth').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('phone_number').optional({ checkFalsy: true }).isString(),
  body('address').optional({ checkFalsy: true }).isString()
];

const agentRules = [
  body('full_name').exists().withMessage('full_name is required').bail().isString().trim().notEmpty(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('invalid email'),
  body('phone_number').optional({ checkFalsy: true }).isString()
];

const policyRules = [
  body('policy_type').optional({ checkFalsy: true }).isString(),
  body('premium_amount').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
  body('coverage_amount').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
  body('start_date').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('end_date').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('customer_id').optional({ checkFalsy: true }).isInt().toInt(),
  body('customer_name').optional({ checkFalsy: true }).isString(),
  body('status').optional({ checkFalsy: true }).isString()
];

const claimRules = [
  body('policy_id').exists().withMessage('policy_id is required').bail().isInt().toInt(),
  body('claim_date').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('claim_amount').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
  body('status').optional({ checkFalsy: true }).isString(),
  body('reason').optional({ checkFalsy: true }).isString()
];

const dashboardRules = [
  body('name').exists().withMessage('name is required').bail().isString().trim().notEmpty(),
  body('description').optional().isString()
  // config validation removed - will be handled by the model
];

function handleValidation(req, res, next){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    return res.status(400).json({ error: 'validation_failed', details: errors.array() });
  }
  next();
}

module.exports = {
  customerRules, agentRules, policyRules, claimRules, dashboardRules, handleValidation
};
