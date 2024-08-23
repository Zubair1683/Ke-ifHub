const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

router.post('/campgrounds/:id/reviews', isLoggedIn, validateReview, catchAsync(reviews.createCampReview))
router.post('/products/:id/reviews', isLoggedIn, validateReview, catchAsync(reviews.createProductReview))

router.delete('/campgrounds/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteCampReview))
router.delete('/products/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteProductReview))

module.exports = router;