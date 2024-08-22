const mongoose = require('mongoose');
const cities = require('./TRcities');
const { places, descriptors } = require('./seedHelpers');
const Products = require('../models/products');

mongoose.connect('mongodb://localhost:27017/NewProject', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Products.deleteMany({});

    try {
        const res = await fetch('https://fakestoreapi.com/products?limit=20');
        const json = await res.json();
        for (let i = 0; i < json.length; i++) {
            const random1000 = Math.floor(Math.random() * 19);
            const product = new Products({
                author: 'sampleUser',
                location: `${cities[random1000].city}, ${cities[random1000].location_name}`,
                title: json[i].title,
                description: json[i].description,
                price: json[i].price,
                geometry: {
                    type: "Point",
                    coordinates: [
                        cities[random1000].longitude,
                        cities[random1000].latitude,
                    ]
                },
                images: [
                    {
                        url: json[i].image,
                        filename: json[i].title
                    },
                    {
                        url: json[i].image,
                        filename: json[i].title
                    }
                ],
                id: "66c7285fc431090adceb82eb"
            });
            await product.save(); // Save each product
        }
    } catch (err) {
        console.error(err);
    }
};


seedDB().then(() => {
    mongoose.connection.close();
})