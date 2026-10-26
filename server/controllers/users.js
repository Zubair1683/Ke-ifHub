const Account = require('../models/accounts');
const { cloudinary } = require('../config/cloudinary');
const kinds = require('../config/kinds');
const { ExpressError, privateUser, publicUser, serializeItem } = require('../utils');

// Items owned by one account, grouped by kind
const itemsOf = async accountId => {
    const out = {};
    for (const kind of Object.values(kinds)) {
        const items = await kind.Model.find({ id: String(accountId) }).sort({ date: -1 }).populate('reviews', 'rating');
        out[kind.name] = items.map(i => serializeItem(i, kind.name));
    }
    return out;
};

// GET /api/users/:id   (public profile + their items)
module.exports.getUser = async (req, res) => {
    const account = await Account.findById(req.params.id);
    if (!account) throw new ExpressError('Cannot find that user', 404);
    const isSelf = req.user && String(req.user._id) === String(account._id);
    res.json({
        user: isSelf ? privateUser(account) : publicUser(account),
        items: await itemsOf(account._id)
    });
};

// PUT /api/users/me   (multipart: optional "image")
module.exports.updateProfile = async (req, res) => {
    const account = req.user;
    const { firstname, lastname, email, phonenumber, country, city, zipcode, birthday, username } = req.body;

    if (req.file) {
        if (account.image && account.image.filename) {
            try { await cloudinary.uploader.destroy(account.image.filename); } catch (e) { /* ignore */ }
        }
        account.image = { url: req.file.path, filename: req.file.filename };
    }
    Object.assign(account, { firstname, lastname, email, phonenumber, country, city, zipcode, birthday, username });
    await account.save();

    res.json({ user: privateUser(account) });
};

// POST /api/users/me/password
module.exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        await req.user.changePassword(oldPassword, newPassword);
    } catch (e) {
        throw new ExpressError(e.message || 'Could not change the password', 400);
    }
    res.json({ message: 'Password changed successfully!' });
};
