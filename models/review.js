const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: String,
    id: String,
    date: {
        type: Date,
        default: Date.now
    },
    imageURL: String
});

module.exports = mongoose.model("Review", reviewSchema);

