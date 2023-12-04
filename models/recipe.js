const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    name: { type: String, required: true },
    ingredients: [String], //array of Strings
    instructions: [String],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    images: [{ type: Schema.Types.ObjectId, ref: 'Image'}],
});

// export model as Recipe
const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;