const Campground = require('../models/campground');
const Review = require('../models/review');
const Account = require('../models/accounts');
const products = require('../models/products');

module.exports.createCampReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user.username;
    review.accountId = req.user._id;
    review.id = campground._id;
    const currentAccount = await Account.findById(req.user._id);
        //console.log(currentAccount)
        if(currentAccount.image) review.imageURL = currentAccount.image.url;
        
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.createProductReview = async (req, res) => {
    const product = await products.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user.username;
    review.accountId = req.user._id;
    review.id = product._id;
    const currentAccount = await Account.findById(req.user._id);
        //console.log(currentAccount)
        if(currentAccount.image) review.imageURL = currentAccount.image.url;
        
        product.reviews.push(review);
    await review.save();
    await product.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/products/${product._id}`);
}

module.exports.deleteCampReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteProductReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await products.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/products/${id}`);
}
