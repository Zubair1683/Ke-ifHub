const Account = require('../models/accounts');
const Review = require('../models/review');
const geocode = require('../lib/geocode');
const { cloudinary } = require('../config/cloudinary');
const { ExpressError, serializeItem, publicUser } = require('../utils');

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isOwner = (item, user) => item.id === String(user._id);
const toArray = v => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

const destroyImage = async filename => {
    try {
        await cloudinary.uploader.destroy(filename);
    } catch (e) {
        // image may live somewhere else (e.g. seeded local images) - nothing to clean up
    }
};

const pickFields = (kind, body) => {
    const data = {};
    kind.fields.forEach(f => { data[f] = body[f]; });
    return data;
};

// GET /api/:kind?q=
module.exports.list = async (req, res) => {
    const { Model, name } = req.kind;
    const q = (req.query.q || '').trim();
    const filter = q ? { title: new RegExp(escapeRegex(q), 'i') } : {};
    const items = await Model.find(filter).sort({ date: -1 }).populate('reviews', 'rating');
    res.json(items.map(i => serializeItem(i, name)));
};

// POST /api/:kind
module.exports.create = async (req, res) => {
    const { Model, name, geo, accountField } = req.kind;
    const item = new Model(pickFields(req.kind, req.body));

    if (geo) item.geometry = await geocode(req.body.location);
    item.images = (req.files || []).map(f => ({ url: f.path, filename: f.filename }));
    item.author = req.user.username;
    item.id = String(req.user._id);

    req.user[accountField].push(item._id);
    await item.save();
    await req.user.save();

    res.status(201).json(serializeItem(item, name));
};

// GET /api/:kind/:id
module.exports.show = async (req, res) => {
    const { Model, name } = req.kind;
    const item = await Model.findById(req.params.id);
    if (!item) throw new ExpressError('Cannot find that item', 404);

    // view counters: one "unique" view per signed-in user, plus a general counter
    if (req.user) {
        const uid = String(req.user._id);
        if (!item.viewMembers.some(v => v.id === uid)) {
            item.viewCounter += 1;
            item.viewMembers.push({ username: req.user.username, id: uid });
        }
    }
    item.generalViewCounter += 1;
    await item.save();

    const reviews = await Review.find({ id: String(item._id) }).sort({ date: -1 });
    const accountIds = [...new Set(reviews.map(r => r.accountId).filter(Boolean))];
    const accounts = await Account.find({ _id: { $in: accountIds } });
    const avatars = {};
    accounts.forEach(a => { avatars[String(a._id)] = a.image && a.image.url; });

    const owner = await Account.findById(item.id);
    const total = reviews.length;
    const avgRating = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

    res.json({
        ...serializeItem(item, name),
        reviews: reviews.map(r => ({
            _id: r._id,
            body: r.body,
            rating: r.rating,
            author: r.author,
            accountId: r.accountId,
            date: r.date,
            imageURL: avatars[r.accountId] || r.imageURL || null
        })),
        reviewCount: total,
        avgRating: Math.round(avgRating * 10) / 10,
        owner: owner ? publicUser(owner) : null
    });
};

// PUT /api/:kind/:id
module.exports.update = async (req, res) => {
    const { Model, name, geo } = req.kind;
    const item = await Model.findById(req.params.id);
    if (!item) throw new ExpressError('Cannot find that item', 404);
    if (!isOwner(item, req.user)) throw new ExpressError('You do not have permission to do that!', 403);

    Object.assign(item, pickFields(req.kind, req.body));
    if (geo) item.geometry = await geocode(req.body.location);

    const newImages = (req.files || []).map(f => ({ url: f.path, filename: f.filename }));
    item.images.push(...newImages);

    const toDelete = toArray(req.body.deleteImages);
    if (toDelete.length) {
        for (const filename of toDelete) await destroyImage(filename);
        item.images = item.images.filter(img => !toDelete.includes(img.filename));
    }

    await item.save();
    res.json(serializeItem(item, name));
};

// DELETE /api/:kind/:id
module.exports.remove = async (req, res) => {
    const { Model, accountField } = req.kind;
    const item = await Model.findById(req.params.id);
    if (!item) throw new ExpressError('Cannot find that item', 404);
    if (!isOwner(item, req.user)) throw new ExpressError('You do not have permission to do that!', 403);

    for (const img of item.images) await destroyImage(img.filename);

    req.user[accountField] = req.user[accountField].filter(id => String(id) !== String(item._id));
    await req.user.save();
    await Model.findOneAndDelete({ _id: item._id }); // also deletes the item's reviews

    res.json({ message: 'Deleted' });
};

// POST /api/:kind/:id/reviews
module.exports.createReview = async (req, res) => {
    const item = await req.kind.Model.findById(req.params.id);
    if (!item) throw new ExpressError('Cannot find that item', 404);

    const review = new Review({
        body: req.body.body,
        rating: req.body.rating,
        author: req.user.username,
        accountId: String(req.user._id),
        id: String(item._id),
        imageURL: req.user.image ? req.user.image.url : undefined
    });
    item.reviews.push(review._id);
    await review.save();
    await item.save();

    res.status(201).json({
        _id: review._id,
        body: review.body,
        rating: review.rating,
        author: review.author,
        accountId: review.accountId,
        date: review.date,
        imageURL: review.imageURL || null
    });
};

// DELETE /api/:kind/:id/reviews/:reviewId
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review || review.id !== id) throw new ExpressError('Cannot find that review', 404);

    const mine = review.accountId === String(req.user._id) || review.author === req.user.username;
    if (!mine) throw new ExpressError('You do not have permission to do that!', 403);

    await req.kind.Model.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Deleted' });
};
