const User = require('../models/user');
const Account = require('../models/accounts');
const Campground = require('../models/campground');
const Products = require('../models/products');
const Review = require('../models/review');


module.exports.renderRegister = (req, res) => {
    res.render('register', { webtitle: "Register" });
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
    res.render('login', { webTitle: "Login" });
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

module.exports.home = async (req, res, next) => {
    const accounts = await Account.find({});
    let orderedAll = [];

    for (const account of accounts) {
        const campgrounds = await Campground.find({ id: account._id });
        const products = await Products.find({ id: account._id });
        for (const product of products) {
            orderedAll.push({ product, author: account.username, accountID: account._id });
        }
        for (const campground of campgrounds) {
            orderedAll.push({ campground, author: account.username, accountID: account._id });
        }

        for (const project of account.projects) {
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
            return new Date(0); // Return a very old date if no date is found
        };
        // Calculate the average rating
        item.averageRating = getDateAvR(item);
        // console.log(project.averageRating, project.project.title)
    });

    // Step 2: Sort the projects based on the average rating
    orderedRecProjects = packageSort(orderedRecProjects, 'averageRating');
    orderedAll = packageSort(orderedAll, 'date');
    orderedtopProjects = packageSort(orderedtopProjects, 'viewCounter');
    orderedTrendProjects = packageSort(orderedTrendProjects, 'GeneralviewCounter')

    // Remove the averageRating property if you don't want it in the final sorted array
    orderedRecProjects.forEach(project => {
        delete project.averageRating;
    });

    orderedRecProjects.sort((a, b) => b.averageRating - a.averageRating).reverse();
    orderedTrendProjects = filter(orderedTrendProjects);
    orderedRecProjects = filter(orderedRecProjects);
    orderedtopProjects = filter(orderedtopProjects);

    res.render(`home`, { orderedtopProjects, orderedAll, orderedTrendProjects, orderedRecProjects, accounts, webTitle: "Home" });
}

module.exports.addProject = async (req, res, next) => {
    res.render('addProject', { webtitle: "addProject" })
}

module.exports.search = async (req, res, next) => {
    // const { id } = req.params;
    const searched = req.body.search.toLowerCase();
    const accounts = await Account.find({});
    const campgrounds = await Campground.find({}).populate('popupText');
    const products = await Products.find({}).populate('popupText');
    let ordered = [];
    // Step 1: Flatten the nested structure
    for (const account of accounts) {
        for (const project of account.projects) {
            let myArray = project.title.toLowerCase().split(" ");
            const normalizedSearchProduct = searched.trim().toLowerCase();
            //console.log(myArray)
            // console.log(myArray.map(item => item.trim().toLowerCase()).includes(normalizedSearchProduct))
            if (project.title.toLowerCase() === searched || myArray.map(item => item.trim().toLowerCase()).includes(normalizedSearchProduct)) ordered.push({ project, author: account.username, accountID: account._id });
            //let myArray = product.title.toLowerCase().split(" ");

            // if(product.title.toLowerCase() === searchProduct || myArray.includes(searchProduct)) orderedProducts.push(product);

        }
        for (const campground of campgrounds) {
            let myArray = campground.title.toLowerCase().split(" ");
            const account1 = await Account.findById(campground.id);
            if (campground.title.toLowerCase() == searched || myArray.includes(searched)) ordered.push({ campground, author: account1.username, accountID: account1._id });

        }
        for (const product of products) {
            let myArray = product.title.toLowerCase().split(" ");
            const normalizedSearchProduct = searched.trim().toLowerCase();
            const account1 = await Account.findById(product.id);
            // Check if product.title matches the normalized searchProduct or is in myArray
            if (normalizedSearchProduct !== "" && product.title.toLowerCase() === normalizedSearchProduct || myArray.map(item => item.trim().toLowerCase()).includes(normalizedSearchProduct)) {
                ordered.push({ product, author: account1.username, accountID: account1._id });
            }
            // if(product.title.toLowerCase() === searchProduct || myArray.includes(searchProduct)) orderedProducts.push(product);

        }
    }
    //console.log(ordered)
    ordered = packageSort(ordered, 'date');
    ordered = ordered.length > 0 ? ordered : null;
    res.render(`search`, { ordered, accounts, searchedText: req.body.search, webTitle: "Home" })
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/home');
}

const filter = (project) => {
    if (project.length < 10) {
        // Calculate the new length (half of the original length)
        const newLength = Math.ceil(project.length / 2);

        // Slice the array to keep only the first `newLength` elements
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
                return 0; // Default to 0 if no view counter is found
            };

        } else {
            getValue = (item) => {
                if (item.product) return item.product[element] || 0;
                if (item.campground) return item.campground[element] || 0;
                if (item.project) return item.project[element] || 0;
                return 0; // Default to 0 if no view counter is found
            };
        }


        const counterA = getValue(a);
        const counterB = getValue(b);

        return counterB - counterA; // Sort by descending view count
    });
};
