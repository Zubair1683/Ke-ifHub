const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: String,      // username
    id: String,          // id of the item that was reviewed
    accountId: String,   // id of the account that wrote it
    date: { type: Date, default: Date.now },
    imageURL: String
});

module.exports = mongoose.model('Review', reviewSchema);
