const Account = require('../models/accounts');
const Campground = require('../models/campground');
const Products = require('../models/products');
const Projects = require('../models/projects');
const Review = require('../models/review');


module.exports.renderRegister = (req, res) => {
    res.render('users/register', { webtitle: "Register" });
}

module.exports.register = async (req, res, next) => {
    try {
        const { firstname, lastname, phonenumber, country, city, zipcode, birthday, email, username, password } = req.body;
        const user = new Account({ firstname, lastname, phonenumber, country, city, zipcode, birthday, email, username });
        const registeredUser = await Account.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/home');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    redirectUrl = req.session.returnTo;
    res.render('users/login', { webTitle: "Login" });
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    if (!redirectUrl) {
        res.redirect(`/home`);
    }
    else if (redirectUrl.includes('comment')) {
        let myArray = redirectUrl.split("/");
        const url = "/" + myArray[1] + "/" + req.user._id + "/" + myArray[3] + "/" + myArray[4];
        delete req.session.returnTo;
        res.redirect(url);

    }
    else {
        res.redirect(redirectUrl);
    }
}

module.exports.renderProfile = async(req, res) => {
    const campgrounds = await Campground.find({ id: req.user._id });
    const products = await Products.find({ id: req.user._id });
    const projects = await Projects.find({ id: req.user._id });
    
    res.render('users/profile', { webTitle: "Profile",  campgrounds, products, projects})
}

module.exports.renderProfileEdit = (req, res) => {
    res.render('users/profileEdit', { webTitle: "about" })
}

module.exports.updateProfile = async (req, res, next) => {
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

    res.redirect('/profile');
}

module.exports.changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    // Find the account by ID
    const account = await Account.findById(req.user._id);

    // Use passport-local-mongoose's built-in changePassword method
    account.changePassword(oldPassword, newPassword, (err) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/profile');
        }

        req.flash('success', 'Password changed successfully!');
        res.redirect('/profile');
    });
}

module.exports.home = async (req, res, next) => {
    const accounts = await Account.find({});
    let orderedAll = [];

    for (const account of accounts) {
        const campgrounds = await Campground.find({ id: account._id });
        const products = await Products.find({ id: account._id });
        const projects = await Projects.find({ id: account._id });
        for (const product of products) {
            orderedAll.push({ product, author: account.username, accountID: account._id });
        }
        for (const campground of campgrounds) {
            orderedAll.push({ campground, author: account.username, accountID: account._id });
        }

        for (const project of projects) {
            orderedAll.push({ project, author: account.username, accountID: account._id });
        }
    }

    let orderedTrendProjects = orderedAll;
    let orderedtopProjects = orderedAll;
    let orderedRecProjects = orderedAll;

    orderedRecProjects.forEach(item => {
        const getDateAvR = (item) => {
            if (item.product) {
                const reviews = item.product.reviews;
                const totalReviews = reviews.length;
                let sumOfRating = 0;
                for (let review of reviews) {
                    sumOfRating += review.rating;
                }
                return totalReviews > 0 ? (sumOfRating / totalReviews + totalReviews) : 0;
            }
            if (item.campground) {
                const reviews = item.campground.reviews;
                const totalReviews = reviews.length;
                let sumOfRating = 0;
                for (let review of reviews) {
                    sumOfRating += review.rating;
                }
                return totalReviews > 0 ? (sumOfRating / totalReviews + totalReviews) : 0;
            }
            if (item.project) {
                const reviews = item.project.reviews;
                const totalReviews = reviews.length;
                let sumOfRating = 0;
                for (let review of reviews) {
                    sumOfRating += review.rating;
                }
                return totalReviews > 0 ? (sumOfRating / totalReviews + totalReviews) : 0;
            }
            return new Date(0); 
        };
        item.averageRating = getDateAvR(item);
    });

    orderedRecProjects = packageSort(orderedRecProjects, 'averageRating');
    orderedAll = packageSort(orderedAll, 'date');
    orderedtopProjects = packageSort(orderedtopProjects, 'viewCounter');
    orderedTrendProjects = packageSort(orderedTrendProjects, 'GeneralviewCounter')

    orderedRecProjects.forEach(project => {
        delete project.averageRating;
    });

    orderedRecProjects.sort((a, b) => b.averageRating - a.averageRating).reverse();
    orderedTrendProjects = filter(orderedTrendProjects);
    orderedRecProjects = filter(orderedRecProjects);
    orderedtopProjects = filter(orderedtopProjects);

    res.render(`users/home`, { orderedtopProjects, orderedAll, orderedTrendProjects, orderedRecProjects, accounts, webTitle: "Home" });
}

module.exports.goToProfile = async(req, res) => {
    const { accountID } = req.params;
    const account = await Account.findById(accountID);
    const campgrounds = await Campground.find({ id: accountID });
    const products = await Products.find({ id: accountID });
    const projects = await Projects.find({ id: accountID });
    res.render('users/goToProfile', { webTitle: "Profile",  campgrounds, products, account,projects})
}

module.exports.renderForgotPassword = (req, res) => {
    res.render('users/forgotPassword', { webTitle: "forgotPassword"})
}

module.exports.forgotPassword = async (req, res) => {
    try {
        let { username, phonenumber, password } = req.body;
        const user = await Account.findOne({ username, phonenumber });

        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/login');
        }

        let { firstname, lastname, country, city, zipcode, birthday, email } = user;
        const campgrounds = await Campground.find({ id: user._id });
        const products = await Products.find({ id: user._id });
        const projects = await Projects.find({ id: user._id });

         await Account.deleteOne({ _id: user._id });
        const newUser = new Account({ firstname, lastname, phonenumber, country, city, zipcode, birthday, email, username,campgrounds, products,projects });
        const registeredUser = await Account.register(newUser, password);

        await Campground.updateMany({ id: user._id }, { $set: { id: newUser._id } });
        await Products.updateMany({ id: user._id }, { $set: { id: newUser._id } });
        await Projects.updateMany({ id: user._id }, { $set: { id: newUser._id } });
        await Review.updateMany({ accountId: user._id }, { $set: { accountId: newUser._id } });
         
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome back to Keşif Hub!');
            res.redirect('/home');
        })
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while changing the password.');
        res.redirect('/forgotPassword');
    }
}

module.exports.search = async (req, res, next) => {
    const searched = req.body.search.toLowerCase();
    const accounts = await Account.find({});
    const campgrounds = await Campground.find({}).populate('popupText');
    const products = await Products.find({}).populate('popupText');
    const projects = await Projects.find({}).populate('popupText');
    let ordered = [];
    
    //for (const account of accounts) {
        
        for (const project of projects) {
            let myArray = project.title.toLowerCase().split(" ");
            const normalizedSearchProduct = searched.trim().toLowerCase();
            const account1 = await Account.findById(project.id);
            if (normalizedSearchProduct !== "" && project.title.toLowerCase() === normalizedSearchProduct || myArray.map(item => item.trim().toLowerCase()).includes(normalizedSearchProduct)) {
                ordered.push({ project, author: account1.username, accountID: account1._id });
            }   
        }
        for (const campground of campgrounds) {
            let myArray = campground.title.toLowerCase().split(" ");
            const normalizedSearchProduct = searched.trim().toLowerCase();
            const account1 = await Account.findById(campground.id);
            if (normalizedSearchProduct !== "" && campground.title.toLowerCase() === normalizedSearchProduct || myArray.map(item => item.trim().toLowerCase()).includes(normalizedSearchProduct)) {
                ordered.push({ campground, author: account1.username, accountID: account1._id });
            } 
        }
        for (const product of products) {
            let myArray = product.title.toLowerCase().split(" ");
            const normalizedSearchProduct = searched.trim().toLowerCase();
            const account1 = await Account.findById(product.id);
            if (normalizedSearchProduct !== "" && product.title.toLowerCase() === normalizedSearchProduct || myArray.map(item => item.trim().toLowerCase()).includes(normalizedSearchProduct)) {
                ordered.push({ product, author: account1.username, accountID: account1._id });
            }
        }
    //}

    ordered = packageSort(ordered, 'date');
    ordered = ordered.length > 0 ? ordered : null;
    res.render(`users/search`, { ordered, accounts, searchedText: req.body.search, webTitle: "Home" })
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/home');
}

const filter = (project) => {
    if (project.length < 10) {
        const newLength = Math.ceil(project.length / 2);
        return project = project.slice(0, newLength);
    }
    else {
        return project = project.slice(0, 10);
    }
}

const packageSort = (items, element) => {
    return items.sort((a, b) => {
        let getValue = null;
        if (element === 'date') {
            getValue = (item) => {
                if (item.product) return new Date(item.product.date);
                if (item.campground) return new Date(item.campground.date);
                if (item.project) return new Date(item.project.date);
                return 0; 
            };
        } else {
            getValue = (item) => {
                if (item.product) return item.product[element] || 0;
                if (item.campground) return item.campground[element] || 0;
                if (item.project) return item.project[element] || 0;
                return 0;
            };
        }

        const counterA = getValue(a);
        const counterB = getValue(b);

        return counterB - counterA;
    });
};
