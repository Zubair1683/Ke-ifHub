require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Account = require('../models/accounts');
const Campground = require('../models/campground');
const Product = require('../models/products');
const Project = require('../models/projects');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/NewProject', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!");
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!");
        console.log(err);
    });



const accountsDB = async () => {
    try {
        await Account.deleteMany({});
        const campgrounds = await Campground.find({});
        const products = await Product.find({});
        const projects = await Project.find({});
       // const hash = await createHash('securepassword');
const password = 'securepassword';
        const sampleUser = {
            firstname: 'user',
            lastname: 'user', 
            email: 'sampleUser@example.com',
            phonenumber: '010101010101',
            country: 'Nowhere',
            city: 'Nowhere',
            zipcode: '1234',
            birthday: new Date(),
            username: 'sampleUser',
            campgrounds: campgrounds,
            products: products,
            projects: projects
        };

        const userAccount = new Account(sampleUser);
        const registeredUser = await Account.register(userAccount, password);
        // point every seeded item at the sample user that was just created
        const ownerId = String(registeredUser._id);
        await Campground.updateMany({}, { $set: { id: ownerId } });
        await Product.updateMany({}, { $set: { id: ownerId } });
        await Project.updateMany({}, { $set: { id: ownerId } });
        console.log('Sample user: sampleUser / securepassword');
       // await userAccount.save();
        console.log("Sample projects inserted successfully!");
    } catch (error) {
        console.error("Error inserting sample projects:", error);
    } finally {
        mongoose.connection.close();
    }
};

accountsDB();
