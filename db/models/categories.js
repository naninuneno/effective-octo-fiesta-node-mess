const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategoriesSchema = new Schema({
    type: String
});

mongoose.model('Categories', CategoriesSchema);