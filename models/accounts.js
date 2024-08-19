const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Campground = require('./campground');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const CommentSchema = new Schema({
    username: String,
    text: String,
    rating: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

const ProjectSchema = new Schema({
    title: {
        type: String
    },
    info: {
        type: String,
        required: true
    },
    images: [ImageSchema],
    shortInfo: {
        type: String,
        required: true
    },
    viewCounter: {
        type: Number,
        default: 0
    },
    generalViewCounter: {
        type: Number,
        default: 0
    },
    viewMembers: [{
        username: String,
        id: String
    }],
    comments: [CommentSchema],
    date: {
        type: Date,
        default: Date.now
    }
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
    projects: [ProjectSchema],
    campgrounds: [{
        type: Schema.Types.ObjectId,
        ref: 'Campground'
    }]
});

UserSchema.plugin(passportLocalMongoose);

const Account = mongoose.model('Account', UserSchema);

module.exports = Account;
