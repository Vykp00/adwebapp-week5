const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: String
});

// export model as category
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;  