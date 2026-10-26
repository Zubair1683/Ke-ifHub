const Campground = require('../models/campground');
const Products = require('../models/products');
const Projects = require('../models/projects');
const { campgroundSchema, productSchema, projectSchema } = require('../schemas');

// One entry per kind of item. The generic controllers read everything from here.
module.exports = {
    campgrounds: {
        name: 'campgrounds',
        Model: Campground,
        schema: campgroundSchema,
        fields: ['title', 'price', 'location', 'description'],
        geo: true,
        accountField: 'campgrounds'
    },
    products: {
        name: 'products',
        Model: Products,
        schema: productSchema,
        fields: ['title', 'price', 'location', 'description'],
        geo: true,
        accountField: 'products'
    },
    projects: {
        name: 'projects',
        Model: Projects,
        schema: projectSchema,
        fields: ['title', 'description'],
        geo: false,
        accountField: 'projects'
    }
};
