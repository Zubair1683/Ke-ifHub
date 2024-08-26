const Products = require('../models/products');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const { cloudinary } = require("../cloudinary");
const Account = require('../models/accounts');
const Review = require('../models/review');


module.exports.index = async (req, res) => {
    const products = await Products.find({}).populate('popupText');
    //console.log(products)
    //console.log(products.length)
    res.render('products/index', { products, webTitle: "products"})
}

module.exports.searchProduct = async (req, res, next) => {
     const searchProduct = req.body.search.toLowerCase();
     const products = await Products.find({}).populate('popupText');
     let orderedProducts = [];

     
    
     // Step 1: Flatten the nested structure
     for (const product of products) {
             let myArray = product.title.toLowerCase().split(" ");
             const normalizedSearchProduct = searchProduct.trim().toLowerCase();

// Check if product.title matches the normalized searchProduct or is in myArray
if (product.title.toLowerCase() === normalizedSearchProduct || myArray.map(item => item.trim().toLowerCase()).includes(normalizedSearchProduct)) {
    orderedProducts.push(product);
}
            // if(product.title.toLowerCase() === searchProduct || myArray.includes(searchProduct)) orderedProducts.push(product);
 
     }
 
     orderedProducts = orderedProducts.length > 0 ? orderedProducts : null;
     res.render('products/index', { products: orderedProducts, webTitle: "Products"})
 }

module.exports.renderNewForm = (req, res) => {
    res.render('products/new', {webTitle: "products"});
}

module.exports.createProduct = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.product.location, { limit: 1 });
    const product = new Products(req.body.product);
    const account = await Account.findById(req.user._id);
   
    product.geometry = geoData.features[0].geometry;
    product.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.author = req.user.username;
    product.id = account._id;
    account.products.push(product);
    await product.save();
    await account.save();
    req.flash('success', 'Successfully made a new product!');
    res.redirect(`/products/${product._id}`)
}

module.exports.showProducts = async (req, res,) => {
    const product = await Products.findById(req.params.id).populate();
    const reviews = await Review.find({ id: product._id });
    if (!product) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('products/show', { product, reviews, webTitle: "product.title" });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const product = await Products.findById(id)
    if (!product) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/products');
    }
    res.render('products/edit', { product, webTitle: "product.title"  });
}

module.exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { product } = req.body;

    // Find the account by the current user's ID
    const account = await Account.findById(req.user._id);

    // Find the campground by its ID and update it
    const updatedProduct = await Products.findByIdAndUpdate(id, { ...product }, { new: true });

    // Fetch geographic data
    const geoData = await maptilerClient.geocoding.forward(req.body.product.location, { limit: 1 });
    updatedProduct.geometry = geoData.features[0].geometry;

    // Add new images to the campground
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedProduct.images.push(...imgs);

    // Save the updated campground
    await updatedProduct.save();

    // If there are images to delete, remove them from both Cloudinary and the campground
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedProduct.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    // Update the campground in the account's campgrounds array
    const accountProductIndex = account.products.findIndex(camp => camp._id.toString() === id);
    if (accountProductIndex !== -1) {
        // Replace the old campground with the updated one
        account.products[accountProductIndex] = updatedProduct;
        await account.save(); // Save the updated account
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/products/${updatedProduct._id}`);
}


module.exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    // Find the campground to delete
    const product = await Products.findById(id)

    if (!product) {
        req.flash('error', 'Campground not found');
        return res.redirect('/products');
    }

    // Find the account of the currently logged-in user
    const account = await Account.findById(req.user._id);

    if (!account) {
        req.flash('error', 'Account not found');
        return res.redirect('/products');
    }

    // Remove the campground from the account's campgrounds array
    account.products = account.products.filter(pro => pro._id.toString() !== id);
    await account.save();
// Optionally, delete associated images from Cloudinary if you have image URLs stored
    // For example, you may need to delete images as follows:
    if (product.images) {
        for (let image of product.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
    }

    // Delete the campground document
    await Products.findByIdAndDelete(id);

    
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/products');
}
