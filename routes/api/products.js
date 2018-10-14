const mongoose = require('mongoose');
const router = require('express').Router();
const Products = mongoose.model('Products');
const Categories = mongoose.model('Categories');

// GET all products
router.get('/', function (req, res, next) {
    Products.find().lean().exec(function (err, products) {
        return res.json(products);
    });
});

// POST new product route
router.post('/', (req, res, next) => {
    var product = req.body;

    if (!product.name) {
        return res.status(422).json({
            errors: {
                name: 'is required',
            },
        });
    }

    if (!product.price) {
        return res.status(422).json({
            errors: {
                price: 'is required',
            },
        });
    }

    if (!product.category) {
        return res.status(422).json({
            errors: {
                category: 'is required',
            },
        });
    }

    return isValidCategory(product.category).then(function(isValid) {
        if (!isValid) {
            return res.status(422).json({
                errors: {
                    category: 'is invalid',
                },
            });
        }

        const newProduct = new Products(product);
        newProduct.save();
        return res.json(newProduct);
    });
});

// GET all categories
router.get('/categories/', (req, res, next) => {
    Categories.find().lean().exec(function (err, categories) {
        return res.json(categories);
    });
});

// POST new category
router.post('/categories/', (req, res, next) => {
    var category = req.body;

    if (!category.type) {
        return res.status(422).json({
            errors: {
                type: 'is required',
            },
        });
    }

    const newCat = new Categories(category);
    newCat.save();
    return res.json(newCat);
});

function isValidCategory(category) {
    return new Promise(function(resolve, reject) {
        if (!category.type) {
            resolve(false);
        }

        Categories.countDocuments( { type: category.type } ).exec((err, count) => {
            if (err) {
                resolve(false);
            }

            resolve(count > 0);
        });
    });
}

module.exports = router;