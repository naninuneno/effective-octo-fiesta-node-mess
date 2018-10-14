const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProductsSchema = new Schema({
    category: Schema.Types.Mixed,
    name: String,
    price: Number
});

mongoose.model('Products', ProductsSchema);