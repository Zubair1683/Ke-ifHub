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
    const reviews = await Review.find({ id: campground.id });
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
   // console.log(campground)
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
   // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
campground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}