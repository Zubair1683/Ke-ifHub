const Account = require('../models/accounts');
const kinds = require('../config/kinds');
const { serializeItem } = require('../utils');

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const allItems = async (filter = {}) => {
    const all = [];
    for (const kind of Object.values(kinds)) {
        const items = await kind.Model.find(filter).populate('reviews', 'rating');
        items.forEach(i => all.push(serializeItem(i, kind.name)));
    }
    return all;
};

const top = (items, scoreFn, n = 8) =>
    [...items].sort((a, b) => scoreFn(b) - scoreFn(a)).slice(0, n);

// GET /api/home
module.exports.home = async (req, res) => {
    const items = await allItems();
    res.json({
        trending: top(items, i => i.generalViewCounter || 0),
        topViewed: top(items, i => i.viewCounter || 0),
        // average rating plus number of reviews, same idea as the old "recommended" list
        recommended: top(items.filter(i => i.reviewCount > 0), i => i.avgRating + i.reviewCount),
        latest: top(items, i => new Date(i.date).getTime(), 12),
        totals: {
            members: await Account.countDocuments(),
            items: items.length
        }
    });
};

// GET /api/search?q=
module.exports.search = async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const items = await allItems({ title: new RegExp(escapeRegex(q), 'i') });
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(items);
};
