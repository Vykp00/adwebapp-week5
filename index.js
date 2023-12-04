const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const multer  = require('multer')
const path = require('path');
require('dotenv').config();

// Connect to MongoDB Schema models
const Recipe = require('./models/recipe');
const Category = require('./models/category');
const Image = require('./models/image');

// Setting up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
// Add db url for CodeGrade
const mongoDB = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/testdb";;

mongoose.connect(mongoDB);
console.log(mongoose.connection.readyState);
console.log("CONNECT");
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

// Old moongoose connection
/*
main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}
*/

// Specify host instead of localhost
const port = 3000;
const host = '127.0.0.1';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Use Multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define a GET route for "/categories"
app.get('/categories', async (req, res) => {
    try {
        // Fetch all categories from the databases
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories', error);
        res.status(500).send('Internal Server Error');
    }
});

// Define a GET route for "/recipe/:food"
app.get('/recipe/:food', async (req, res) => {
    const foodName = req.params.food;

    try {
        // Find the recipe with the given food name in the database
        const recipe = await Recipe.findOne({ name: foodName });

        if (recipe) {
            // Send the recipe as JSON if found
            res.json(recipe);
        } else {
            // Return 404 if the require is not found
            res.status(404).send('Recipe not found');
        }
    } catch (error) {
        console.error('Error fetching recipe', error);
        res.status(500).send('Internal Server Error');
    }
});

// Define a POST route for "/recipe/"
app.post("/recipe/", async (req, res) => {
    const newRecipe = req.body;

    // Create a new Recipe instance
    const recipe = new Recipe(newRecipe)

    /*
    // Map the image file name to their respective ObjectID and save to the recipe
    //before sending to the whole recipe to database
    const images = await Promise.all(recipe.images.map(async image => {
        const imageObj = await Image.findOne({ name: image.name });
        return imageObj._id;
    }));
    recipe.images = images;
    */
    // save recipe
    await recipe.save();

    // Send the JSON object back
    res.json(recipe);
});

// Define a POST images route
app.post('/recipe/:id/images', upload.array('images', 5), async (req, res) => {
    try {
        const recipeID = req.params.id;

        // save the image to the database
        const savedImages = await Promise.all(
            req.files.map(async file => {
                const newImage = new Image({
                    buffer: file.buffer,
                    mimetype: file.mimetype,
                    name: file.originalname,
                    encoding: file.encoding
                });
                return await newImage.save()
            })
        );
        // Update the recipe with the ObjectIDs of the saved images
        const recipe = await Recipe.findByIdAndUpdate(
            recipeID,
            { $push: { images: { $each: savedImages.map(image => image._id) } } },
            { new: true }
        );
        // Confirm new resource is created
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Error adding images to recipe:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Define a GET route for "/images/:imageId"
app.get('/images/:imageId', async (req, res) => {
    try {
        const imageId = req.params.imageId;

        // Find image from Image Collection
        const image = await Image.findById(imageId);

        if (!image) {
            return res.status(404).send('Image not found');
        }

        // Set the necessary header for sending an image
        res.setHeader('Content-Type', image.mimetype);
        res.setHeader('Content-Disposition', 'inline');

        // Send the image buffer as the response
        res.send(image.buffer);
    } catch (error) {
        console.error('Error fetching image: ', error);
        res.status(500).send('Internal Server Error');
    }
});
// Start the server
app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});