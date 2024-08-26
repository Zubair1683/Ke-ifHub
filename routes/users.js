const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const Account = require('../models/accounts');
const { isLoggedIn } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const Campground = require('../models/campground');
const Products = require('../models/products');
const Projects = require('../models/projects');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/home', catchAsync(users.home))
router.post('/search', catchAsync(users.search))

router.get('/profile', isLoggedIn, users.renderProfile)

router.get('/goToProfile/:accountID', async(req, res) => {
    const { accountID } = req.params;
    const account = await Account.findById(accountID);
    const campgrounds = await Campground.find({ id: accountID });
    const products = await Products.find({ id: accountID });
    const projects = await Projects.find({ id: accountID });
    res.render('users/goToProfile', { webTitle: "Profile",  campgrounds, products, account,projects})
})



router.get('/renderProfileEdit', isLoggedIn, users.renderProfileEdit)

router.post('/updateProfile', isLoggedIn, upload.single('image'), catchAsync(users.updateProfile));

router.post('/changePassword', isLoggedIn, catchAsync(users.changePassword));

router.get('/logout', users.logout)


router.get('/contact', isLoggedIn, (req, res) => {
    res.render('contact', { webTitle: "Contact"})
})

router.get('/about', isLoggedIn, (req, res) => {
    res.render('about', { webTitle: "about" })
})

module.exports = router;