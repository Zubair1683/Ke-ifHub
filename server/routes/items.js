const router = require('express').Router();
const items = require('../controllers/items');
const kinds = require('../config/kinds');
const { catchAsync, ExpressError } = require('../utils');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate, validateItem, uploadMany } = require('../middleware/validate');
const { reviewSchema } = require('../schemas');

// :kind is one of campgrounds | products | projects
router.param('kind', (req, res, next, name) => {
    req.kind = kinds[name];
    req.kind ? next() : next(new ExpressError('Not found', 404));
});

router.route('/:kind')
    .get(catchAsync(items.list))
    .post(requireAuth, uploadMany, validateItem, catchAsync(items.create));

router.route('/:kind/:id')
    .get(optionalAuth, catchAsync(items.show))
    .put(requireAuth, uploadMany, validateItem, catchAsync(items.update))
    .delete(requireAuth, catchAsync(items.remove));

router.post('/:kind/:id/reviews', requireAuth, validate(reviewSchema), catchAsync(items.createReview));
router.delete('/:kind/:id/reviews/:reviewId', requireAuth, catchAsync(items.deleteReview));

module.exports = router;
