const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const projectSchema = new Schema({
    title: {
        type: String
    },
    images: [ImageSchema],
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
    description: {
        type: String,
        required: true
    },
    location: String,
    author: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    date: {
        type: Date,
        default: Date.now
    },
    id: String
}, opts);


projectSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/projects/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});



projectSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Project', projectSchema);