const User = require('../models/user');
const Account = require('../models/accounts');
const Campground = require('../models/campground');

module.exports.renderRegister = (req, res) => {
    res.render('register', {webtitle: "Register"});
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
    res.render('login', {webTitle : "Login"});
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    console.log(redirectUrl)
    if (!redirectUrl) {
        res.redirect(`/home`);
    }
    else if (redirectUrl.includes('comment')) {
        let myArray = redirectUrl.split("/");
        const url = "/" + myArray[1] + "/" + req.user._id  + "/" + myArray[3] + "/" + myArray[4];
        delete req.session.returnTo;
        res.redirect(url);

    }
    else {
        res.redirect(redirectUrl);
    }
}

module.exports.home = async (req, res, next) => {
    const accounts = await Account.find({});
    
    //console.log(accounts[0])
    let orderedAll = [];
    let orderedProjects = [];
    let orderedtopProjects = [];
    let orderedTrendProjects = [];
    let orderedRecProjects = [];
  
// Now you can use the campground as needed

//console.log(firstCampground);
    for (const account of accounts) {
        const campgrounds = await Campground.find({ id: account._id });
        //const campground = account.campgrounds[0];
        for(const campground of campgrounds){
            orderedAll.push({ campground, author: account.username, accountID: account._id });
        }
       // console.log(campgrounds);
        for (const project of account.projects) {
            orderedAll.push({ project, author: account.username, accountID: account._id });
            orderedProjects.push({ project, author: account.username, accountID: account._id });
            orderedtopProjects.push({ project, author: account.username, accountID: account._id });
            orderedTrendProjects.push({ project, author: account.username, accountID: account._id });
            orderedRecProjects.push({ project, author: account.username, accountID: account._id });
        }
    }

    orderedTrendProjects = orderedAll;

    // Step 2: Sort the flattened array based on a criterion

    orderedRecProjects.forEach(project => {
        const comments = project.project.comments;
        const totalComments = comments.length;
        let sumOfRating = 0;
        for (let comment of comments) {
            sumOfRating += comment.rating;
        }

        // Calculate the average rating
        project.averageRating = totalComments > 0 ? (sumOfRating / totalComments + totalComments) : 0;
       // console.log(project.averageRating, project.project.title)
    });

    // Remove the averageRating property if you don't want it in the final sorted array
    orderedRecProjects.forEach(project => {
        delete project.averageRating;
    });

    // Step 2: Sort the projects based on the average rating
    orderedProjects.sort((a, b) => new Date(b.project.date) - new Date(a.project.date));
    orderedtopProjects.sort((a, b) => b.project.viewCounter - a.project.viewCounter);
    orderedTrendProjects.sort((a, b) => {
            if(a.campground && b.project){
                b.project.GeneralviewCounter - a.campground.GeneralviewCounter
            }
            else if(b.campground && a.project){
                b.campground.GeneralviewCounter - a.project.GeneralviewCounter
            }
            else if(a.campground && b.campground) {
                b.campground.GeneralviewCounter - a.campground.GeneralviewCounter
            }
            else{
                b.project.GeneralviewCounter - a.project.GeneralviewCounter
            }
     } ).reverse();
   
    orderedRecProjects.sort((a, b) => b.averageRating - a.averageRating).reverse();
    orderedAll.reverse();
//console.log(orderedRecProjects)
    orderedTrendProjects = filter(orderedTrendProjects);
    orderedRecProjects = filter(orderedRecProjects);
    orderedtopProjects = filter(orderedtopProjects);
   // console.log(orderedTrendProjects.length)
    res.render(`home`, { orderedtopProjects, orderedAll, orderedTrendProjects, orderedRecProjects, accounts, webTitle: "Home" });
}

module.exports.addProject = async (req, res, next) => {
    res.render('addProject', { webtitle: "addProject" })
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