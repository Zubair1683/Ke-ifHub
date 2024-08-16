const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Account = require('../models/accounts');
const session = require('express-session');
const passport = require('passport');
const { isLoggedIn } = require('../middleware');
const mongoose = require('mongoose');
const users = require('../controllers/user');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/signUp')
    .get(users.renderSignUp)
    .post(catchAsync(users.signUp));

let redirectUrl = `/home`;

router.route('/login')
    .get(users.renderLogIn)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.logIn)

router.get('/home', catchAsync(users.home))

router.get('/myAccount', isLoggedIn, catchAsync(users.profile))

router.get('/logOut', users.logOut)

router.get('/contact', isLoggedIn, (req, res) => {
    res.render('contact', { webTitle: "Contact"})
})

router.get('/about', isLoggedIn, (req, res) => {
    res.render('about', { webTitle: "about" })
})

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


router.get('/prof', isLoggedIn, (req, res) => {
    res.render('profile', { webTitle: "Profile" })
})
router.post('/addProfileImage', isLoggedIn, upload.single('image'), catchAsync(async (req, res, next) => {
    const account = await Account.findById(req.user._id);
    if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).send("No file uploaded");
    }

    const img = { url: req.file.path, filename: req.file.filename };
    account.image = img;
    await account.save();

    res.redirect('/prof');
}));

module.exports = router;