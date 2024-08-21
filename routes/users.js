const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const Account = require('../models/accounts');
const { isLoggedIn } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const Campground = require('../models/campground');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/home', catchAsync(users.home))
router.post('/search', catchAsync(users.search))

router.get('/prof', isLoggedIn, async(req, res) => {
    const campgrounds = await Campground.find({ id: req.user._id });
    res.render('profile', { webTitle: "Profile",  campgrounds})
})

router.get('/addProject', isLoggedIn, catchAsync(users.addProject))

router.get('/renderProfileEdit', isLoggedIn, (req, res) => {
    res.render('profileEdit', { webTitle: "about" })
})

router.post('/updateProfile', isLoggedIn, upload.single('image'), catchAsync(async (req, res, next) => {
    const account = await Account.findById(req.user._id);
    if (req.file) {
        const img = { url: req.file.path, filename: req.file.filename };
        account.image = img;
    }

   
    account.firstname = req.body.firstname;
    account.lastname = req.body.lastname;
    account.email = req.body.email;
    account.phonenumber = req.body.phonenumber;
    account.country = req.body.country;
    account.city = req.body.city;
    account.zipcode = req.body.zipcode;
    account.birthday = req.body.birthday;
    account.username = req.body.username;
    await account.save();

    res.redirect('/prof');
}));

router.post('/changePassword', isLoggedIn, catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    // Find the account by ID
    const account = await Account.findById(req.user._id);

    // Use passport-local-mongoose's built-in changePassword method
    account.changePassword(oldPassword, newPassword, (err) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/prof');
        }

        req.flash('success', 'Password changed successfully!');
        res.redirect('/prof');
    });
}));

router.get('/logout', users.logout)

module.exports = router;