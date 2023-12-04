const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    buffer: Buffer,
    mimetype: String,
    name: String,
    encoding: String
});

// export model as Image
const Image = mongoose.model('Image', imageSchema);
module.exports = Image;