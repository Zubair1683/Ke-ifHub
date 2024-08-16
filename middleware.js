const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Account = require('./models/accounts');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const { projectSchema } = require('./schemas.js');
const Review = require('./models/review');
const mongoose = require('mongoose');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isMatched = (req, res, next) => {
    const { id} = req.params;
    const objectIdAccountID = new mongoose.Types.ObjectId(id);
    if (!req.user._id.equals(objectIdAccountID)) {
        req.flash('error', 'Your account is not matched with the current user!!! Please dont try to enter wrong ID!!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

/*module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}*/

module.exports.isAuthor = async (req, res, next) => {
    //const { id } = req.params;
    const { accountID, projectID } = req.params;
    const account = await Account.findById(accountID);
    const project = account.projects.id(projectID);
    if (!project) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/home`);
    }
    next();
}

module.exports.validateProject = (req, res, next) => {
    const { error } = projectSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}