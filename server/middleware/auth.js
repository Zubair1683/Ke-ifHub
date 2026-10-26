const jwt = require('jsonwebtoken');
const Account = require('../models/accounts');
const { ExpressError, catchAsync } = require('../utils');

const secret = () => process.env.JWT_SECRET || 'dev-only-secret-change-me';

module.exports.signToken = user =>
    jwt.sign({ id: String(user._id) }, secret(), { expiresIn: '7d' });

const loadUser = async req => {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return null;
    try {
        const payload = jwt.verify(header.slice(7), secret());
        return await Account.findById(payload.id);
    } catch (e) {
        return null;
    }
};

// Request must carry a valid token
module.exports.requireAuth = catchAsync(async (req, res, next) => {
    const user = await loadUser(req);
    if (!user) throw new ExpressError('You must be signed in first!', 401);
    req.user = user;
    next();
});

// Token is optional; req.user is set when it is valid
module.exports.optionalAuth = catchAsync(async (req, res, next) => {
    req.user = await loadUser(req);
    next();
});
