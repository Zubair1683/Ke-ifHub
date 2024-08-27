const Campground = require('../models/campground');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const { cloudinary } = require("../cloudinary");
const Account = require('../models/accounts');
const Review = require('../models/review');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}).populate('popupText');
    res.render('campgrounds/index', { campgrounds, webTitle: "Campgrounds"})
}

module.exports.searchCampground = async (req, res, next) => {
     const searchCampground = req.body.search.toLowerCase();
     const campgrounds = await Campground.find({}).populate('popupText');
     let orderedcamps = [];

     for (const campground of campgrounds) {
             let myArray = campground.title.toLowerCase().split(" ");
             if(campground.title.toLowerCase() == searchCampground || myArray.includes(searchCampground)) orderedcamps.push(campground);
 
     }

     orderedcamps = orderedcamps.length > 0 ? orderedcamps : null;
     res.render('campgrounds/index', { campgrounds: orderedcamps, webTitle: "Campgrounds"})
 }

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new', {webTitle: "Campgrounds"});
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    const account = await Account.findById(req.user._id);
   
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user.username;
    campground.id = account._id;
    account.campgrounds.push(campground);
    await campground.save();
    await account.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate();
    const reviews = await Review.find({ id: campground._id });
    if(reviews.length > 0){
        for(let review of reviews){
            const account = await Account.findOne({ username: review.author});
            if(account){
                if(account.image){
                    review.imageURL = account.image.url;
                    await review.save();
                }
            }
        }
    }
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground, reviews, webTitle: "campground.title" });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground, webTitle: "campground.title"  });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const { campground } = req.body;
    const account = await Account.findById(req.user._id);
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...campground }, { new: true });
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    updatedCampground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedCampground.images.push(...imgs);

    await updatedCampground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    const accountCampgroundIndex = account.campgrounds.findIndex(camp => camp._id.toString() === id);
    if (accountCampgroundIndex !== -1) {
        account.campgrounds[accountCampgroundIndex] = updatedCampground;
        await account.save();
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }

    const account = await Account.findById(req.user._id);

    if (!account) {
        req.flash('error', 'Account not found');
        return res.redirect('/campgrounds');
    }

    account.campgrounds = account.campgrounds.filter(camp => camp._id.toString() !== id);
    await account.save();
    if (campground.images) {
        for (let image of campground.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
    }
    await Campground.findByIdAndDelete(id);

    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}
