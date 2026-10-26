const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

/**
 * Builds the mongoose model for one of the three item kinds
 * (campgrounds, products, projects) - they share almost the same shape.
 */
module.exports = function buildItemModel(modelName, { withGeometry, withPrice, descriptionRequired }) {
    const definition = {
        title: String,
        images: [ImageSchema],
        description: descriptionRequired ? { type: String, required: true } : String,
        viewCounter: { type: Number, default: 0 },
        generalViewCounter: { type: Number, default: 0 },
        viewMembers: [{ username: String, id: String }],
        location: String,
        author: String, // username of the owner
        reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
        date: { type: Date, default: Date.now },
        id: String      // _id of the owner account (kept so existing data keeps working)
    };

    if (withPrice) definition.price = Number;
    if (withGeometry) {
        definition.geometry = {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }
        };
    }

    const schema = new Schema(definition, { toJSON: { virtuals: true } });

    schema.post('findOneAndDelete', async function (doc) {
        if (doc) await Review.deleteMany({ _id: { $in: doc.reviews } });
    });

    return mongoose.model(modelName, schema);
};
