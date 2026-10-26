const router = require('express').Router();
const auth = require('../controllers/auth');
const { catchAsync } = require('../utils');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema, forgotPasswordSchema } = require('../schemas');

router.post('/register', validate(registerSchema), catchAsync(auth.register));
router.post('/login', validate(loginSchema), catchAsync(auth.login));
router.get('/me', requireAuth, auth.me);
router.post('/forgot-password', validate(forgotPasswordSchema), catchAsync(auth.forgotPassword));

module.exports = router;
