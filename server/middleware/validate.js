const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { ExpressError } = require('../utils');

const validate = schema => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const msg = error.details.map(d => d.message).join(', ');
        return next(new ExpressError(msg, 400));
    }
    req.body = value;
    next();
};

// Validates against the schema of the item kind in the URL
const validateItem = (req, res, next) => validate(req.kind.schema)(req, res, next);

const uploader = multer({ storage });
const wrap = handler => (req, res, next) =>
    handler(req, res, err => (err ? next(new ExpressError(`Upload failed: ${err.message}`, 400)) : next()));

module.exports = {
    validate,
    validateItem,
    uploadMany: wrap(uploader.array('image')),
    uploadOne: wrap(uploader.single('image'))
};
