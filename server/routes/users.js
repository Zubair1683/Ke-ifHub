const router = require('express').Router();
const users = require('../controllers/users');
const { catchAsync } = require('../utils');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate, uploadOne } = require('../middleware/validate');
const { profileSchema, changePasswordSchema } = require('../schemas');

router.put('/me', requireAuth, uploadOne, validate(profileSchema), catchAsync(users.updateProfile));
router.post('/me/password', requireAuth, validate(changePasswordSchema), catchAsync(users.changePassword));
router.get('/:id', optionalAuth, catchAsync(users.getUser));

module.exports = router;
