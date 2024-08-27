const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const { isLoggedIn } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/home', catchAsync(users.home))
router.post('/search', catchAsync(users.search))

router.get('/profile', isLoggedIn, users.renderProfile)

router.get('/goToProfile/:accountID', users.goToProfile)

router.get('/renderProfileEdit', isLoggedIn, users.renderProfileEdit)

router.post('/updateProfile', isLoggedIn, upload.single('image'), catchAsync(users.updateProfile));

router.post('/changePassword', isLoggedIn, catchAsync(users.changePassword));

router.get('/logout', users.logout)

router.get('/forgotPassword', users.renderForgotPassword)

router.post('/forgotPassword', users.forgotPassword)




router.get('/contact', isLoggedIn, (req, res) => {
    res.render('contact', { webTitle: "Contact"})
})

router.get('/about', isLoggedIn, (req, res) => {
    res.render('about', { webTitle: "about" })
})

module.exports = router;