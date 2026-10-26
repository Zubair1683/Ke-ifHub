const Joi = require('joi');

// Item forms arrive as multipart/form-data, so every value is a flat string.
const deleteImages = Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string());

module.exports.campgroundSchema = Joi.object({
    title: Joi.string().trim().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    deleteImages
});

module.exports.productSchema = Joi.object({
    title: Joi.string().trim().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    deleteImages
});

module.exports.projectSchema = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    deleteImages
});

module.exports.reviewSchema = Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().trim().required()
});

module.exports.registerSchema = Joi.object({
    firstname: Joi.string().trim().required(),
    lastname: Joi.string().trim().required(),
    phonenumber: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    zipcode: Joi.string().trim().required(),
    birthday: Joi.date().required(),
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    username: Joi.string().trim().min(3).required(),
    password: Joi.string().min(6).required()
});

module.exports.loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

module.exports.profileSchema = Joi.object({
    firstname: Joi.string().trim().required(),
    lastname: Joi.string().trim().required(),
    phonenumber: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    zipcode: Joi.string().trim().required(),
    birthday: Joi.date().required(),
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    username: Joi.string().trim().min(3).required()
});

module.exports.changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

module.exports.forgotPasswordSchema = Joi.object({
    username: Joi.string().required(),
    phonenumber: Joi.string().required(),
    password: Joi.string().min(6).required()
});
