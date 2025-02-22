const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Campground = require('./campground');
const Product = require('./products');
const Schema = mongoose.Schema;
const Review = require('./review')

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: ImageSchema,
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    campgrounds: [{
        type: Schema.Types.ObjectId,
        ref: 'Campground'
    }],
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
});

UserSchema.plugin(passportLocalMongoose);

const Account = mongoose.model('Account', UserSchema);

module.exports = Account;
