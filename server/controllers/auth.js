const Account = require('../models/accounts');
const { signToken } = require('../middleware/auth');
const { ExpressError, privateUser } = require('../utils');

const authenticate = (username, password) =>
    new Promise((resolve, reject) => {
        Account.authenticate()(username, password, (err, user, info) => {
            if (err) return reject(err);
            resolve(user || null);
        });
    });

// POST /api/auth/register
module.exports.register = async (req, res) => {
    const { password, ...profile } = req.body;
    const account = new Account(profile);
    const user = await Account.register(account, password);
    res.status(201).json({ token: signToken(user), user: privateUser(user) });
};

// POST /api/auth/login
module.exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await authenticate(username, password);
    if (!user) throw new ExpressError('Incorrect username or password', 401);
    res.json({ token: signToken(user), user: privateUser(user) });
};

// GET /api/auth/me
module.exports.me = (req, res) => {
    res.json({ user: privateUser(req.user) });
};

// POST /api/auth/forgot-password
// Same flow as the old app: username + phone number identify the owner of the account.
// NOTE: this is weak security - see README ("Things you may want to improve").
module.exports.forgotPassword = async (req, res) => {
    const { username, phonenumber, password } = req.body;
    const user = await Account.findOne({ username, phonenumber });
    if (!user) throw new ExpressError('No account matches that username and phone number', 404);
    await user.setPassword(password);
    await user.save();
    res.json({ token: signToken(user), user: privateUser(user) });
};
