class ExpressError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Safe shape of an account for the account owner
const privateUser = u => ({
    _id: u._id,
    username: u.username,
    firstname: u.firstname,
    lastname: u.lastname,
    email: u.email,
    phonenumber: u.phonenumber,
    country: u.country,
    city: u.city,
    zipcode: u.zipcode,
    birthday: u.birthday,
    image: u.image || null
});

// Safe shape of an account for everybody else (no email / phone / birthday)
const publicUser = u => ({
    _id: u._id,
    username: u.username,
    firstname: u.firstname,
    lastname: u.lastname,
    country: u.country,
    city: u.city,
    image: u.image || null
});

// An item (campground / product / project) as sent to the client
const serializeItem = (doc, kind, extra = {}) => {
    const obj = doc.toJSON ? doc.toJSON() : { ...doc };
    delete obj.viewMembers;
    delete obj.__v;
    const reviews = Array.isArray(obj.reviews) ? obj.reviews : [];
    const rated = reviews.filter(r => r && typeof r.rating === 'number');
    const reviewCount = reviews.length;
    const avgRating = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : 0;
    return {
        ...obj,
        reviews: undefined,
        kind,
        reviewCount,
        avgRating: Math.round(avgRating * 10) / 10,
        ownerId: obj.id,
        ...extra
    };
};

module.exports = { ExpressError, catchAsync, privateUser, publicUser, serializeItem };
