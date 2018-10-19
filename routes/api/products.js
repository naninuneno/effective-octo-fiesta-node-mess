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

// POST new product
router.post('/', (req, res, next) => {
    getProductFromRequest(req).then(function (product) {
        if (product.errors) {
            return res.status(422).json(product);
        }

        const newProduct = new Products(product);
        newProduct.save();
        return res.json(newProduct);
    });
});

// GET single product
router.get('/:id', function (req, res, next) {
    Products.findById(req.params.id).lean().exec(function (err, product) {
        return res.json(product);
    });
});

// DELETE single product
router.delete('/:id', function (req, res, next) {
    Products.findByIdAndRemove(req.params.id, function (err, product) {
        if (err) {
            return res.json(err);
        } else {
            return res.json(product);
        }
    });
});

// EDIT single product
router.put('/:id', function (req, res, next) {
    return getProductFromRequest(req)
        .then(function (update) {
            return new Promise(function (resolve, reject) {
                if (update.errors || (!update.name)) {
                    return reject(update);
                }

                Products.findOneAndUpdate(
                    {"_id": req.params.id},
                    {
                        $set: {
                            "name": update.name,
                            "price": update.price,
                            "category": update.category
                        }
                    },
                    {new: true}
                ).then(function (product) {
                    console.log('returning product');
                    return resolve(product);
                });
            })
        })
        .then(function (update) {
            console.log('this should be like 3rd');
            return res.json(update);
        })
        .catch(function (err) {
            return res.status(422).json(err);
        });
});

function getProductFromRequest(req) {
    return new Promise(function (resolve, reject) {
        const product = req.body;

        if (!product.name) {
            return resolve({
                errors: {
                    name: 'is required',
                },
            });
        }

        if (!product.price) {
            return resolve({
                errors: {
                    price: 'is required',
                },
            });
        }

        if (!product.category) {
            return resolve({
                errors: {
                    category: 'is required',
                },
            });
        }

        return isValidCategory(product.category).then(function (isValid) {
            if (!isValid) {
                return resolve({
                    errors: {
                        category: 'is invalid',
                    },
                });
            }

            return resolve(product);
        });
    });
}

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
    return new Promise(function (resolve, reject) {
        if (!category || !category.type) {
            resolve(false);
        }

        Categories.countDocuments({type: category.type}).exec((err, count) => {
            if (err) {
                resolve(false);
            }

            resolve(count > 0);
        });
    }).catch(function (rej) {
        console.log(rej);
    });
}

module.exports = router;