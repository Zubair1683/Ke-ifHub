const express = require('express');
const router = express.Router();
const products = require('../controllers/products');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground, validateProduct, isProductAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(products.index))
    .post(isLoggedIn, upload.array('image'), validateProduct, catchAsync(products.createProduct))

router.post('/searchProduct', catchAsync(products.searchProduct))
router.get('/new', isLoggedIn, products.renderNewForm)

router.route('/:id')
    .get(catchAsync(products.showProducts))
   .put(isLoggedIn, isProductAuthor, upload.array('image'), validateProduct, catchAsync(products.updateProduct))
    .delete(isLoggedIn, isProductAuthor, catchAsync(products.deleteProduct));

router.get('/:id/edit', isLoggedIn, isProductAuthor, catchAsync(products.renderEditForm))


module.exports = router;